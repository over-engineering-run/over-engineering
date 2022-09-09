"""nlp pipeline logic"""

import re
from typing import Callable
from collections import Counter
from bs4 import BeautifulSoup

from src import programming_languages as prog_lang


def extract_content(
        html: str
) -> dict:

    """extract content text from HTML"""

    # parse html
    soup = BeautifulSoup(html, features="html.parser")

    # remove 'a', 'img' and '<pre><code>'
    for s_a in soup('a'):
        s_a.decompose()
    for s_img in soup('img'):
        s_img.decompose()
    for s_pre in soup('pre'):
        for s_code in s_pre('code'):
            s_code.decompose()

    # extract content text
    content_text = soup.get_text().strip()

    # result
    extracted_info = {
        'processed_content_html': str(soup),
        'content_text':           content_text
    }

    return extracted_info


def extract_code(
        html: str, content_text: str, prog_lang_inv_syn_dict: dict, prog_lang_rep: re.Pattern
) -> dict:

    """extract code block and programming languages from HTML and content"""

    # extract codes from html
    soup = BeautifulSoup(html, features="html.parser")

    code_info_list = []
    prog_lang_counter = Counter()
    for s_pre in soup('pre'):
        for s_code in s_pre('code'):

            if s_code.attrs.get('class') and len(s_code.attrs.get('class')) > 0:
                raw_lang_str = s_code.attrs.get('class')[0]
                lang_str = prog_lang.parse_programming_language_from_code_attr(
                    raw_lang_str, prog_lang_inv_syn_dict
                )
                prog_lang_counter[lang_str] += 1
            else:
                lang_str = 'unknown'

            code_info_list.append(
                {
                    'language': lang_str,
                    'content':  s_code.get_text()
                }
            )

    # extract programming language from content
    prog_lang_list = []
    if len(prog_lang_counter) > 0:
        prog_lang_list += list(prog_lang_counter.keys())
    else:
        prog_lang_list = prog_lang.extract_programming_language_from_content(
            content_text,
            prog_lang_rep,
            prog_lang_inv_syn_dict
        )

    # result
    extracted_info = {
        'content_code_info':      code_info_list,
        'programming_languages':  prog_lang_list
    }

    return extracted_info


def process_content_text(
        content_text: str, jieba_tokenizer: Callable, stopword_set: set
) -> dict:

    """process content: word segmentation, stop word removal"""

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

        # line processing
        processed_word_list = []
        for word in word_list:

            word = word.strip().lower()

            # stopword removal
            if (not word) or (word in stopword_set):
                continue

            processed_word_list.append(word)

        processed_line = " ".join(processed_word_list)
        processed_line_list.append(processed_line)

    extracted_info = {
        'word_seg_content_text':           '\n'.join(word_seg_line_list),
        'word_seg_processed_content_text': '\n'.join(processed_line_list)
    }

    return extracted_info


def keyword_extraction(
        kw_extraction_model: Callable, word_seg_processed_content_text: str
) -> dict:

    """Keyword Extraction from Processed Contents"""

    kw_tup_list = kw_extraction_model.extract_keywords(
        word_seg_processed_content_text,
        keyphrase_ngram_range=(1, 1),
        top_n=5
    )
    kw_list = [ kw_tup[0] for kw_tup in kw_tup_list ]

    kwp_tup_list = kw_extraction_model.extract_keywords(
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
