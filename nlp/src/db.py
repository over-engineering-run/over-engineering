"""access database with backend APIs"""

from urllib.parse import urljoin
import requests


def get_articles_count(api_server_url: str) -> int:

    """get articles count with API /statistics/v1/count_articles"""

    articles_count_req_url = urljoin(
        api_server_url,
        '/statistics/v1/count_articles'
    )

    resp = requests.get(articles_count_req_url, timeout=5)
    if resp.status_code != 200:
        raise Exception("failed to get articles count")

    return resp.json().get('count', 0)


def get_articles(api_server_url: str, offset: int, limit: int) -> list:

    """get articles with API /db/v1/articles"""

    get_articles_req_url = urljoin(
        api_server_url,
        f"/db/v1/articles?offset={offset}&limit={limit}"
    )

    resp = requests.get(get_articles_req_url, timeout=10)
    if resp.status_code != 200:
        raise Exception(f"failed to get articles: offset {offset}, limit {limit}")

    return resp.json()


def update_articles(
        api_server_url: str, data: dict, primary_key_val: str,
):

    """udpate articles with API /db/v1/articles"""

    update_articles_req_url = urljoin(
        api_server_url,
        "/db/v1/articles"
    )

    resp = requests.patch(
        update_articles_req_url,
        json={
            "primary_key": "href",
            "primary_key_val": primary_key_val,
            "data": data
        },
        timeout=3
    )

    if resp.status_code != 200:
        raise Exception("failed to update articles")
