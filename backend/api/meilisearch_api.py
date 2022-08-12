import os
import json
import time
import datetime

from flask import Flask, request, Response, abort
import meilisearch as ms


class EndpointAction():

    def __init__(self, action, action_params):
        self.action = action
        self.action_params = action_params

    def __call__(self, *args, **kwargs):
        return self.action(self.action_params)


class MeilisearchAPIServer():

    app = None
    ms_client = None
    ms_docs_index = None
    ms_keywords_index = None

    def __init__(self, name, host="0.0.0.0", port=5000, debug=False):

        # init flask app
        self.host = host
        self.port = port
        self.debug = debug
        self.app = Flask(name)

        # init meilisearch client
        url = os.getenv("MEILISEARCH_URL")
        docs_index = os.getenv("MEILISEARCH_DOCUMENTS_INDEX")
        keywords_index = os.getenv("MEILISEARCH_KEYWORDS_INDEX")

        if not url:
            self.app.logger.error("Missing env MEILISEARCH_URL while connecting to Meilisearch server.")
            abort(500)
        elif not docs_index:
            self.app.logger.error("Missing env MEILISEARCH_DOCUMENTS_INDEX while connecting to Meilisearch server.")
            abort(500)
        elif not keywords_index:
            self.app.logger.error("Missing env MEILISEARCH_KEYWORDS_INDEX while connecting to Meilisearch server.")
            abort(500)
        else:
            self.ms_url = url
            self.ms_docs_index = docs_index
            self.ms_keywords_index = keywords_index
            self.ms_client = ms.Client(url)

        # init API
        self.add_endpoint(
            endpoint="/v1/index",
            endpoint_name="index_docs",
            handler=self.index,
            handler_params={"index": self.ms_docs_index},
            req_methods=["POST"]
        )
        self.add_endpoint(
            endpoint="/v1/search",
            endpoint_name="search_docs",
            handler=self.search_docs,
            handler_params={"index": self.ms_docs_index},
            req_methods=["GET"]
        )
        # self.add_endpoint(
        #     endpoint="/v1/index/auto-complete",
        #     endpoint_name="index_keywords",
        #     handler=self.index,
        #     handler_params={"index": self.ms_keywords_index},
        #     req_methods=["POST"]
        # )
        # self.add_endpoint(
        #     endpoint="/v1/search/auto-complete",
        #     endpoint_name="search_keywords",
        #     handler=self.search_keywords,
        #     handler_params={"index": self.ms_keywords_index},
        #     req_methods=["GET"]
        # )

    def run(self):
        self.app.run(debug=self.debug, port=self.port, host=self.host)

    def add_endpoint(self, endpoint=None, endpoint_name=None, handler=None, handler_params=None, req_methods=["GET"]):
        self.app.add_url_rule(endpoint, endpoint_name, EndpointAction(handler, handler_params), methods=req_methods)

    def index(self, params: dict):

        # parse and check request
        req_data = request.get_json().get("data")
        if not req_data:
            self.app.logger.error("Missing index request data.")
            return Response(status=500, headers={})

        # run index
        ms_index = params.get('index', None)
        if not ms_index:
            return Response(status=500, headers={})

        resp = self.ms_client.index(ms_index).add_documents(req_data)
        return Response(
            response=json.dumps(resp),
            status=200,
            headers={"Content-Type": "application/json"}
        )

    def search_docs(self, params: dict):

        # parse and check request
        req_args_key_set = set(request.args.keys())
        req_must_key_set = {'q', 'page', 'limit'}

        if (req_must_key_set - req_args_key_set) != set():
            self.app.logger.error("Missing params {} in doc search request.".format(
                req_must_key_set - req_args_key_set
            ))
            return Response(status=400, headers={})

        query = request.args.get('q', type=str)
        page = request.args.get('page', type=int)
        limit = request.args.get('limit', type=int)
        hashtags = request.args.getlist('hashtags', type=str)

        # meilisearch sdk request
        ms_request = {
            'offset': page * limit,
            'limit':  limit
        }

        raw_filter = []
        if len(hashtags) > 0:
            for h in hashtags:
                raw_filter.append("hashtags = {}".format(h))
        ms_request['filter'] = ' AND '.join(raw_filter)

        # run search
        ms_index = params.get('index', None)
        if not ms_index:
            return Response(status=500, headers={})

        raw_resp = self.ms_client.index(ms_index).search(
            query,
            opt_params=ms_request
        )
        if not raw_resp:
            self.app.logger.error("Failed to run search request on Meilisearch.")
            return Response(status=500, headers={})

        # parse raw search response
        resp = {
            'query': raw_resp['query'],
            'total': raw_resp['estimatedTotalHits'],
            'result': []
        }
        for i, raw_hit in enumerate(raw_resp['hits']):

            hit = {

                'position': i,
                'title':    raw_hit['title'],
                'link':     raw_hit['href'],
                'lastmod':  str_to_unix_time(raw_hit['published_at'], "%Y-%m-%d %H:%M:%S"),

                'about_this_result': {

                    'author': {
                        'name': raw_hit['author_name'],
                        'link': raw_hit['author_href']
                    },
                    'series': {
                        'name': raw_hit['series_name'],
                        'link': raw_hit['series_href']
                    },

                    "hashtags":     raw_hit['hashtags'],
                    "keywords":     raw_hit['keywords'],
                    "reading_time": raw_hit['reading_time']
                }
            }
            resp['result'].append(hit)

        return Response(
            response=json.dumps(resp),
            status=200,
            headers={"Content-Type": "application/json"}
        )


def str_to_unix_time(time_str:str, format_str: str):
    return int(time.mktime(datetime.datetime.strptime(time_str, format_str).timetuple()))

def calculte_reading_time():
    pass


if __name__ == "__main__":

    ms_api_server = MeilisearchAPIServer(
        name="meilisearch_api",
        host=os.getenv("FLASK_HOST"),
        port=os.getenv("FLASK_PORT"),
        debug=True
    )
    ms_api_server.run()
