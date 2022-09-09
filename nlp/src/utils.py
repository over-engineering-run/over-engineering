"""utils and tools"""

import time
import datetime


def date_str_to_unix_time(time_str: str, format_str: str) -> int:
    """format data string"""
    return int(time.mktime(datetime.datetime.strptime(time_str, format_str).timetuple()))


def count_chinese_tech_article_reading_time(content: str, code_list: list) -> int:
    """heuristic logic to count a Chinese tech article reading time"""
    return max(len(content)//300, 1) + len(code_list)
