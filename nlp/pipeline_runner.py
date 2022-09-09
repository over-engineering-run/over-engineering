"""interface for starting nlp pipeline"""

import argparse
import logging
from multiprocessing import cpu_count, Pool

from src import db
from src import parallel
from src import pipeline

def parse_args():

    """parse and process input arguments"""

    parser = argparse.ArgumentParser("Run NLP Processing pipeline.")

    parser.add_argument(
        "--flask_url",
        default="http://0.0.0.0:5000",
        type=str,
        help='backend server url (default: https://0.0.0.0:5000)'
    )

    parser.add_argument(
        "--parallel_n",
        default=1,
        type=int,
        help='multiprocessing running with n processors (default: 1)'
    )

    parser.add_argument(
        "--batch_size",
        default=1000,
        type=int,
        help='batch size (default: 1000)'
    )

    parser.add_argument(
        "--nlp_root",
        type=str,
        help='the absolute path of nlp directory'
    )

    parser.add_argument(
        "--config",
        type=str,
        help='the absolute path of pipeline config file'
    )

    parser.add_argument(
        "--start",
        default=0,
        type=int,
        help='offset for skipping n docs (default: 0)'
    )

    parser.add_argument(
        "--limit",
        default=-1,
        type=int,
        help='limit the number of docs to run nlp processing (default: -1, no limit)'
    )

    raw_args = parser.parse_args()

    # check and process arguments
    raw_args.parallel_n = max(1, raw_args.parallel_n)
    raw_args.batch_size = max(1, raw_args.batch_size)

    return raw_args


if __name__ == '__main__':

    args = parse_args()
    logging.basicConfig(encoding='utf-8', level=logging.INFO)

    # check arguments
    api_server_url = args.flask_url.strip()
    if len(api_server_url) == 0:
        logging.error("missing or invalid --flask_url")

    # split articles_n by processes_n
    # and generate index list for each process
    articles_n = db.get_articles_count(api_server_url)
    processes_n = min(cpu_count(), args.parallel_n)
    parallel_backlog_index_list = parallel.generate_parallel_backlog_index_list(
        articles_n, processes_n, args.batch_size, args.start, args.limit
    )

    # load config
    pipeline_config = pipeline.load_pipeline_config(
        base_dir=args.nlp_root, config_path=args.config
    )

    # start nlp pipeline with multiprocessing
    pool = Pool(processes=processes_n)

    for process_i in range(processes_n):

        logging.info("starting %d / %d process for nlp pipeline", process_i, processes_n)

        pipeline_params = {
            "loglevel":           logging.INFO,
            "api_server_url":     api_server_url,
            "backlog_index_list": parallel_backlog_index_list[process_i]
        }

        pool.apply_async(
            func=pipeline.pipeline,
            args=[pipeline_config, pipeline_params]
        )

    pool.close()
    pool.join()
