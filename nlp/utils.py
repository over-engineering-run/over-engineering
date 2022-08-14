import time, datetime


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
