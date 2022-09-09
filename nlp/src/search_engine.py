"""access search engine with backend APIs"""

from urllib.parse import urljoin
import requests


def bulk_indexing_docs_search(api_server_url: str, data: list):

    """index indexing a list of docs with API /docs/v1/index"""

    indexing_req_url = urljoin(api_server_url, '/docs/v1/index')

    resp = requests.post(indexing_req_url, json=data, timeout=10)
    if resp.status_code != 200:
        raise Exception("failed to run bulk_indexing_docs_search")


def bulk_index_keywords_search(api_server_url: str, data: list):

    """index indexing a list of keywords with API /docs/v1/index/auto-complete"""

    indexing_req_url = urljoin(api_server_url, '/docs/v1/index/auto-complete')

    resp = requests.post(indexing_req_url, json=data, timeout=10)
    if resp.status_code != 200:
        raise Exception("failed to run bulk_index_keyword_search")
