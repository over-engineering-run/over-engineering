import os
import json
import uuid

import jieba
from keybert import KeyBERT

import utils
import preprocessing as prepro


if __name__ == '__main__':

    nlp_root = os.getcwd()

    # ----- initialization and setup

    # init jieba tokenizer
    jieba_dict_path = os.path.join(nlp_root, "resources/jieba_dict.txt.big")
    jieba_tokenizer = jieba.Tokenizer(dictionary=jieba_dict_path)

    # load stop word set
    stop_word_file_list = [
        "resources/jieba_stop_words.txt",
        "resources/puntuation_mark.list",
        "resources/traditional_chinese_stop_list.txt"
    ]
    stop_word_set = set()
    for fp_relative in stop_word_file_list:
        fp_absolute = os.path.join(nlp_root, fp_relative)
        s_set = utils.load_stop_word_set(fp_absolute)
        stop_word_set |= s_set

    # db parameters
    db_path = os.path.join(nlp_root, "testing/testing-ironman_100.db")
    sql_query = """
        SELECT
            a.href,
            a.title,
            a.content AS content_html,
            a.tags AS raw_tags_string,
            a.genre,
            a.publish_at AS published_at,
            a.author_href,
            u.name AS author_name,
            a.series_href,
            s.name AS series_name,
            a.series_no AS series_num
        FROM articles a
        LEFT JOIN users u
        ON a.author_href = u.href
        LEFT JOIN series s
        ON a.series_href = s.href
        LIMIT 100;
    """

    # load keyword extraction model
    kw_model = KeyBERT(model="paraphrase-multilingual-MiniLM-L12-v2")

    # load programming language synonym json and build syn_map and inv_syn_map
    pro_lang_syn_map, pro_lang_inv_syn_map = utils.load_syn_map(
        os.path.join(nlp_root, "resources/programming_language.json")
    )

    # build programming language matching regex pattern
    pro_lang_rep = utils.build_programming_language_matching_regex_pattern(pro_lang_syn_map)


    # ----- preprocessing pipeline
    # preprocessing_load_data_from_sql(db_path: str, sql_query: str, uid_name: str) -> dict
    # preprocessing_extract_html(info: dict, html: str, pro_lang_inv_syn_map: dict, pro_lang_rep: re.Pattern) -> dict
    # preprocessing_content_text(info: dict, content_text: str, stopword_set: set) -> dict
    # preprocessing_keyword_extraction(info: dict, kw_extract_model: Callable, word_seg_processed_content_text: str) -> dict

    # init: load data from sql
    info_dict = prepro.preprocessing_load_data_from_sql(db_path, sql_query, uid_name="href")
    info_dict_n = len(info_dict.keys())

    # start pipeline
    for info_i, k in enumerate(info_dict):

        print("Preprocessing {} / {} ...".format(info_i+1, info_dict_n))

        # extract from html
        extracted_info = prepro.preprocessing_extract_html(
            info_dict[k],
            info_dict[k]['content_html'],
            pro_lang_inv_syn_map,
            pro_lang_rep
        )
        info_dict[k].update(extracted_info)

        # preprocess content
        extracted_info = prepro.preprocessing_content_text(
            info_dict[k],
            jieba_tokenizer,
            info_dict[k]['content_text'],
            stop_word_set
        )
        info_dict[k].update(extracted_info)

        # keyword extraction
        extracted_info = prepro.preprocessing_keyword_extraction(
            info_dict,
            kw_model,
            info_dict[k]['word_seg_processed_content_text']
        )
        info_dict[k].update(extracted_info)

        print("Extracted keywords: ")
        print(extracted_info)
        print()


    # ----- formatting and finalize

    doc_search_res_dict_list = []
    keyword_search_res_dict_list = []
    for k in info_dict:

        # docs
        doc_search_res_dict = {
            'uuid':                       str(uuid.uuid4()),
            'href':                       info_dict[k]['href'],
            'title':                      info_dict[k]['title'],
            'raw_hl_content':             info_dict[k]['content_text'],
            'word_seg_processed_content': info_dict[k]['word_seg_processed_content_text'],
            'keywords':                   info_dict[k]['extracted_keywords'],
            'hashtags':                   info_dict[k]['raw_tags_string'].split(','),
            'genre':                      info_dict[k]['genre'],
            'published_at':               info_dict[k]['published_at'],
            'published_at_unix':          utils.date_str_to_unix_time(
                                              info_dict[k]['published_at'],
                                              "%Y-%m-%d %H:%M:%S"
                                          ),
            'author_href':                info_dict[k]['author_href'],
            'author_name':                info_dict[k]['author_name'],
            'series_href':                info_dict[k]['series_href'],
            'series_name':                info_dict[k]['series_name'],
            'series_num':                 info_dict[k]['series_num'],
            'reading_time':               utils.count_chinese_tech_article_reading_time(
                                              info_dict[k]['content_text'],
                                              info_dict[k]['content_code_info']
                                          )
        }
        doc_search_res_dict_list.append(doc_search_res_dict)

        # keyword phrases
        for kp in info_dict[k]['extracted_keywords_phrases']:
            keyword_search_res_dict = {
                'uuid':    str(uuid.uuid4()),
                'phrase': kp,
            }
            keyword_search_res_dict_list.append(keyword_search_res_dict)

    # ----- output

    # output nlp preprocessing result file for future reuse
    with open(os.path.join(nlp_root, "testing/nlp_preprocessing_result_info.json"), 'w') as ofile:
        ofile.write(json.dumps(info_dict, indent=4, ensure_ascii=False))

    # output to local for meilisearch indexing and debugging
    with open(os.path.join(nlp_root, "testing/testing-meilisearch_docs_indexing.json"), 'w') as ofile:
        ofile.write(json.dumps(doc_search_res_dict_list, indent=4, ensure_ascii=False))

    with open(os.path.join(nlp_root, "testing/testing-meilisearch_keywords_indexing.json"), 'w') as ofile:
        ofile.write(json.dumps(keyword_search_res_dict_list, indent=4, ensure_ascii=False))
