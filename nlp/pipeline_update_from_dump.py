"""update db and search engine using pipeline info dump"""

import logging
import argparse
import json
import time

from src import db
from src import pipeline
from src import search_engine


def parse_args():

    """parse and process input arguments"""

    parser = argparse.ArgumentParser("Update db and search engine using pipeline info dump.")

    parser.add_argument(
        "--flask_url",
        default="http://0.0.0.0:5000",
        type=str,
        help='backend server url (default: https://0.0.0.0:5000)'
    )

    parser.add_argument(
        "--input",
        type=str,
        help='path of input pipeline info dump'
    )

    raw_args = parser.parse_args()

    return raw_args


if __name__ == '__main__':

    args = parse_args()
    logging.basicConfig(encoding='utf-8', level=logging.INFO)

    # load from dump
    logging.info("loading pipeline info from %s", args.input)

    pipeline_info_list = []
    with open(args.input, 'r') as infile:

        for line in infile:
            if line.strip():
                pipeline_info_list.append(
                    json.loads(line.strip())
                )

    logging.info("%d pipeline info from %s", len(pipeline_info_list), args.input)

    # update db articles
    for info_i, pipeline_info in enumerate(pipeline_info_list):

        if (info_i%100) == 0:
            logging.info(
                "updating %d / %d pipeline info to db",
                info_i,
                len(pipeline_info_list),
            )

        db_update_info = pipeline.pipeline_info_to_db_update_info(pipeline_info)
        db.update_articles(
            api_server_url=args.flask_url,
            data=db_update_info,
            primary_key_val=pipeline_info['href'],
        )

    # prepare indexing search engine
    docs_search_info_list = []
    kws_search_info_list  = []
    for pipeline_info in pipeline_info_list:
        docs_search_info_list.append(
            pipeline.pipeline_info_to_docs_search_indexing_info(pipeline_info)
        )
        kws_search_info_list += pipeline.pipeline_info_to_keywords_search_indexing_info_list(
            pipeline_info
        )

    # index docs search
    head = 0
    batch_size = 1000
    total_n = len(docs_search_info_list)
    while head < total_n:

        rear = min(total_n, head + batch_size)

        logging.info(
            "indexing %d to %d (total %d) docs to search engine",
            head,
            rear,
            total_n
        )

        search_engine.bulk_indexing_docs_search(
            args.flask_url, docs_search_info_list[head:rear]
        )
        head = rear

        time.sleep(30)

    # index keywords search
    head = 0
    batch_size = 10000
    total_n = len(kws_search_info_list)
    while head < total_n:

        rear = min(total_n, head + batch_size)

        logging.info(
            "indexing %d to %d (total %d) keywords to search engine",
            head,
            rear,
            total_n
        )

        search_engine.bulk_index_keywords_search(
            args.flask_url, kws_search_info_list[head:rear]
        )
        head = rear

        time.sleep(10)
