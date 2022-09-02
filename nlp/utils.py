import time, datetime
from collections import Counter
import json

import re

# load synonym json and build syn_map and inv_syn_map
def load_syn_map(file_path: str) -> (dict, dict):

    # syn map
    with open(file_path, 'r') as infile:
        raw_syn_map = json.load(infile)

    syn_map = {}
    for k in raw_syn_map:

        chosen_syn = k.lower().strip()

        syn_list = []
        for raw_syn in raw_syn_map[k]:
            syn = raw_syn.lower().strip()
            syn_list.append(syn)

        syn_map[chosen_syn] = syn_list

    # inverted syn map
    inv_syn_map = {}
    for chosen_syn in syn_map:
        for syn in syn_map[chosen_syn]:
            inv_syn_map[syn] = chosen_syn

    return syn_map, inv_syn_map


# extract programming language name from code block attribute
# such as <code class=\"language-javascript\">
def parse_programming_language_from_code_attr(code_attr: str, inv_syn_map: dict) -> str:

    if not code_attr:
        return ''
    raw_lang_str = re.sub(r'(?i)[\-\=]|language', ' ', code_attr)

    # preprocess
    lang_str = raw_lang_str.lower().strip()

    # syn -> chosen syn
    lang_str = inv_syn_map.get(lang_str, lang_str)

    return lang_str


# build programming language matching regex pattern
def build_programming_language_matching_regex_pattern(lang_syn_map: dict) -> re.Pattern:

     # regex pattern
    all_lang_list = []
    for k in lang_syn_map:
        all_lang_list.append(k)
        all_lang_list += lang_syn_map[k]

    # sort by len: match longer one first
    all_lang_list = sorted(all_lang_list, key=lambda x: (-len(x), x))

    # re escape
    esc_all_lang_list = [ re.escape(lang.strip()) for lang in all_lang_list ]

    # joined all lang with |
    lang_raw_reg = r'(' + '|'.join(esc_all_lang_list) + r')'

    # add word boundry to ensure matching whole word
    lang_raw_reg = r'(?:^|[^a-zA-Z0-9:])' + lang_raw_reg + r'(?:$|[^a-zA-Z0-9:])'

    # ignore case
    lang_raw_reg = r'(?i)'+ lang_raw_reg

    return re.compile(lang_raw_reg)


# extract programming language name from content
def extract_programming_language_from_content(content: str, lang_rep: re.Pattern, inv_syn_map: dict) -> list:

    # findall not empty
    raw_match_list = [ m.strip().lower() for m in lang_rep.findall(content) if m.strip() ]

    # map syn
    match_list = [ inv_syn_map.get(m, m) for m in raw_match_list ]

    # filter by freq 1
    freq_map = Counter(match_list)
    candidate_lang = sorted(freq_map.keys(), key=lambda k: freq_map[k], reverse=True)
    res_lang_list = [ k for k in candidate_lang if freq_map[k] > 1 ]

    return res_lang_list


def load_stop_word_set(file_path: str) -> set:

    res_set = set()

    with open(file_path, 'r') as infile:
        for line in infile:
            line = line.strip().lower()
            if line:
                res_set.add(line)

    return res_set


def date_str_to_unix_time(time_str: str, format_str: str) -> int:
    return int(time.mktime(datetime.datetime.strptime(time_str, format_str).timetuple()))


def count_chinese_tech_article_reading_time(content: str, code_list: list) -> int:
    return max(len(content)//300, 1) + len(code_list)
