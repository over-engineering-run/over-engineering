import os
import json
from typing import Callable

import sqlite3
from bs4 import BeautifulSoup


# Preprocessing 1: Load Data from SQL
def preprocessing_load_data_from_sql(db_path: str, sql_query: str, uid_name: str) -> dict:

    # create a SQL connection to our SQLite database
    con = sqlite3.connect(db_path)
    cur = con.cursor()

    # select articles left join series and users
    raw_data = cur.execute(sql_query)

    # header
    col_names = []
    for idx, col in enumerate(cur.description):
        col_names.append(col[0])

    # return info_dict[uid_value] = info
    info_dict = {}
    for row in raw_data:
        info = { k:v.strip() for k, v in zip(col_names, row) }
        info_dict[info[uid_name]] = info

    cur.close()

    return info_dict


# Preprocessing 2: Extract Content from HTML
# extract code block and content text from HTML
def preprocessing_extract_html(info: dict, html: str) -> dict:

    # parse html
    soup = BeautifulSoup(html, features="html.parser")

    # remove 'a' and 'img'
    for s_a in soup('a'):
        s_a.decompose()
    for s_img in soup('img'):
        s_img.decompose()

    # extract codes from content
    code_list = []
    for s_pre in soup('pre'):
        for s_code in s_pre('code'):
            code_list.append(s_code.get_text())
            s_code.decompose()

    # result
    extracted_info = {
        'processed_content_html': str(soup),
        'content_text':           soup.get_text().strip(),
        'content_codes':          code_list,
    }

    return extracted_info


# Preprocessing 3: Content Text
# word segmentation, stop word removal
def preprocessing_content_text(info: dict, jieba_tokenizer: Callable, content_text: str, stopword_set: set) -> dict:

    # split content into line
    line_list = []
    for line in content_text.split():

        line = line.strip()
        if not line:
            continue
        line_list.append(line)

    # process content line
    word_seg_line_list = []
    processed_line_list = []
    for line in line_list:

        # word segmentation
        word_list = jieba_tokenizer.lcut(line, HMM=True)
        word_seg_line = " ".join(word_list)
        word_seg_line_list.append(word_seg_line)

        # start line processing
        processed_word_list = []
        for w in word_list:

            w = w.strip().lower()

            # stopword removal
            if not w or w in stopword_set:
                continue
            processed_word_list.append(w)
        processed_line = " ".join(processed_word_list)
        processed_line_list.append(processed_line)

    extracted_info = {
        'word_seg_content_text':           '\n'.join(word_seg_line_list),
        'word_seg_processed_content_text': '\n'.join(processed_line_list)
    }

    return extracted_info


# Preprocessing 4: Keyword Extraction from Processed Contents
def preprocessing_keyword_extraction(info: dict, kw_extract_model: Callable, word_seg_processed_content_text: str) -> dict:

    kw_tup_list = kw_extract_model.extract_keywords(
        word_seg_processed_content_text,
        keyphrase_ngram_range=(1, 1),
        top_n=5
    )
    kw_list = [ kw_tup[0] for kw_tup in kw_tup_list ]

    kwp_tup_list = kw_extract_model.extract_keywords(
        word_seg_processed_content_text,
        keyphrase_ngram_range=(1, 2),
        top_n=5
    )
    kwp_list = [ kwp_tup[0] for kwp_tup in kwp_tup_list ]

    extracted_info = {
        "extracted_keywords":         kw_list,
        "extracted_keywords_phrases": kwp_list
    }

    return extracted_info
