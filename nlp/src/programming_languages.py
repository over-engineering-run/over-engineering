"""programming languages extraction logic"""

import re
from collections import Counter


def build_programming_language_matching_regex_pattern(lang_syn_map: dict) -> re.Pattern:

    """
    build programming language matching regex pattern;
    the input should be programming language inverted synonym dict
    """

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
    lang_raw_reg = r'(?:^|[^a-zA-Z0-9:\-])' + lang_raw_reg + r'(?:$|[^a-zA-Z0-9:\-])'

    # ignore case
    lang_raw_reg = r'(?i)'+ lang_raw_reg

    return re.compile(lang_raw_reg)


def extract_programming_language_from_content(content: str, lang_rep: re.Pattern, inv_syn_map: dict) -> list:

    """
    extract programming languages from input text;
    depends on the regex pattern built by build_programming_language_matching_regex_pattern;
    will filter those appear less or equal only 1 time
    """

    # findall not empty
    raw_match_list = [ m.strip().lower() for m in lang_rep.findall(content) if m.strip() ]

    # map syn
    match_list = [ inv_syn_map.get(m, m) for m in raw_match_list ]

    # filter by freq 1
    freq_map = Counter(match_list)
    candidate_lang = sorted(freq_map.keys(), key=lambda k: freq_map[k], reverse=True)
    res_lang_list = [ k for k in candidate_lang if freq_map[k] > 1 ]

    return res_lang_list


def parse_programming_language_from_code_attr(code_attr: str, inv_syn_map: dict) -> str:

    """
    extract programming language name from code block attribute;
    such as <code class=\"language-javascript\">
    """

    if not code_attr:
        return ''
    raw_lang_str = re.sub(r'(?i)[\-\=]|language', ' ', code_attr)

    # preprocess
    lang_str = raw_lang_str.lower().strip()

    # syn -> chosen syn
    lang_str = inv_syn_map.get(lang_str, lang_str)

    return lang_str
