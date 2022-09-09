"""pipeline logic and utils"""

import os
import sys
import logging
import uuid
import yaml

import jieba
from keybert import KeyBERT

from src import utils
from src import resources
from src import db
from src import programming_languages as prog_lang
from src import preprocessing as preprocess
from src import search_engine


# config should contain:
# - resources
#   - jieba_dict
#   - jieba_stop_words
#   - puntuation_mark
#   - programming_languages
# - models
#   - keybert_model
def load_pipeline_config(base_dir: str, config_path: str) -> dict:

    """
    load pipeline config;
    all resources in the config should be relative to base_dir (nlp root dir)
    """

    # load raw config
    with open(config_path, 'r', encoding='utf-8') as infile:
        try:
            raw_config = yaml.safe_load(infile)
        except yaml.YAMLError as yaml_e:
            logging.error(yaml_e)
            sys.exit(1)

    # relative path -> absolute path
    for res_key in raw_config['resources']:
        res_val = raw_config['resources'][res_key]
        raw_config['resources'][res_key] = os.path.join(base_dir, res_val)

    return raw_config


def init_pipeline_resources(config: dict) -> dict:

    """
    load pipeline resource and resturn resource dict;
    depends on the config load by load_pipeline_config
    """


    # init jieba tokenizer
    jieba_tokenizer = jieba.Tokenizer(dictionary=config['resources']['jieba_dict'])

    # load stop word set
    stop_word_file_list = [
        config['resources']['jieba_stop_words'],
        config['resources']['puntuation_mark'],
        config['resources']['programming_languages']
    ]
    stop_word_set = set()
    for path in stop_word_file_list:
        s_set = resources.load_stop_word_set(path)
        stop_word_set |= s_set

    # load keyword extraction model
    logging.info("loading model %s...", config['models']['keybert_model'])
    keybert_model = KeyBERT(model="paraphrase-multilingual-MiniLM-L12-v2")

    # load programming language synonym json and build syn_map and inv_syn_map
    prog_lang_syn_dict, prog_lang_inv_syn_dict = resources.load_syn_map(
        config['resources']['programming_languages']
    )

    # build programming language matching regex pattern
    prog_lang_re_pattern = prog_lang.build_programming_language_matching_regex_pattern(
        prog_lang_syn_dict
    )

    # result
    result_resources = {
        "jieba_tokenizer":        jieba_tokenizer,
        "stop_word_set":          stop_word_set,
        "keybert_model":          keybert_model,
        "prog_lang_syn_dict":     prog_lang_syn_dict,
        "prog_lang_inv_syn_dict": prog_lang_inv_syn_dict,
        "prog_lang_re_pattern":   prog_lang_re_pattern
    }

    return result_resources


def pipeline_info_to_db_update_info(pipeline_info: dict) -> dict:

    """get db update json from pipeline result"""

    db_update_info = {
        "programming_languages": pipeline_info['programming_languages'],
        "keywords_unigram":      pipeline_info['extracted_keywords'],
        "keywords_bigram":       pipeline_info['extracted_keywords_phrases']
    }

    return db_update_info


def pipeline_info_to_docs_search_indexing_info(pipeline_info: dict) -> dict:

    """ms indexing json for search from pipeline result"""

    ms_indexing_info = {
        'uuid':                       str(uuid.uuid4()),
        'href':                       pipeline_info['href'],
        'title':                      pipeline_info['title'],
        'raw_hl_content':             pipeline_info['content_text'],
        'word_seg_processed_content': pipeline_info['word_seg_processed_content_text'],
        'keywords':                   pipeline_info['extracted_keywords'],
        'hashtags':                   pipeline_info['raw_tags_string'].split(','),
        'genre':                      pipeline_info['genre'],
        'published_at':               pipeline_info['published_at'],
        'published_at_unix':          utils.date_str_to_unix_time(
                                          pipeline_info['published_at'],
                                          "%Y-%m-%d %H:%M:%S"
                                      ),
        'author_href':                pipeline_info['author_href'],
        'author_name':                pipeline_info['author_name'],
        'series_href':                pipeline_info['series_href'],
        'series_name':                pipeline_info['series_name'],
        'series_num':                 pipeline_info['series_num'],
        'reading_time':               utils.count_chinese_tech_article_reading_time(
                                          pipeline_info['content_text'],
                                          pipeline_info['content_code_info']
                                      )
    }

    return ms_indexing_info


def pipeline_info_to_keywords_search_indexing_info(pipeline_info: dict) -> dict:

    """ms indexing json for auto fill from pipeline result"""

    ms_indexing_info = {
        'uuid':    str(uuid.uuid4()),
        'phrase': pipeline_info['extracted_keywords_phrases']
    }

    return ms_indexing_info


def pipeline(config: dict, params: dict):

    """run nlp pipeline, update db and index search engine"""

    logging.basicConfig(encoding='utf-8', level=params.get('loglevel', logging.INFO))

    # load and init resources using config
    pipeline_resources = init_pipeline_resources(config)

    # pipeline process by batches
    for head, rear in params['backlog_index_list']:

        # load raw data from db
        articles = db.get_articles(
            api_server_url=params['api_server_url'],
            offset=head,
            limit=rear-head
        )

        # nlp pipeline
        pipeline_info_list = []
        for articles_i, pipeline_info in enumerate(articles):

            if (articles_i % 10) == 0:
                logging.info(
                    "Preprocessing %d to %d: %d/%d",
                    head, rear, articles_i, (rear-head)
                )

            # extract content text from html
            extracted_info = preprocess.extract_content(
                pipeline_info['content_html']
            )
            pipeline_info.update(extracted_info)

            # extract code block and programming languages from content
            extracted_info = preprocess.extract_code(
                pipeline_info['content_html'],
                pipeline_info['content_text'],
                pipeline_resources['prog_lang_inv_syn_dict'],
                pipeline_resources['prog_lang_re_pattern']
            )
            pipeline_info.update(extracted_info)

            # preprocess content
            extracted_info = preprocess.process_content_text(
                pipeline_info['content_text'],
                pipeline_resources['jieba_tokenizer'],
                pipeline_resources['stop_word_set']
            )
            pipeline_info.update(extracted_info)

            # keyword extraction
            extracted_info = preprocess.keyword_extraction(
                pipeline_resources['keybert_model'],
                pipeline_info['word_seg_processed_content_text']
            )
            pipeline_info.update(extracted_info)

            # append result
            pipeline_info_list.append(pipeline_info)

        # update db
        for pipeline_info in pipeline_info_list:
            db_update_info = pipeline_info_to_db_update_info(pipeline_info)
            db.update_articles(
                api_server_url=params['api_server_url'],
                data=db_update_info,
                primary_key_val=pipeline_info['href'],
            )

        # index search engine
        docs_search_info_list = []
        kws_search_info_list  = []
        for pipeline_info in pipeline_info_list:
            docs_search_info_list.append(
                pipeline_info_to_docs_search_indexing_info(pipeline_info)
            )
            kws_search_info_list.append(
                pipeline_info_to_keywords_search_indexing_info(pipeline_info)
            )

        search_engine.bulk_indexing_docs_search(
            params['api_server_url'], docs_search_info_list
        )
        search_engine.bulk_index_keywords_search(
            params['api_server_url'], kws_search_info_list
        )
