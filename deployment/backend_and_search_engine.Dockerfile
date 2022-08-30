FROM --platform=linux/amd64 python:3.10.6-slim-buster
LABEL maintainer="tainvecs@gmail.com"


# env
ENV BACKEND_ROOT="/backend"
ENV FLASK_HOST="0.0.0.0"
ENV FLASK_PORT="5000"
ENV FLASK_URL="http://$FLASK_HOST:$FLASK_PORT"

ENV MEILISEARCH_ROOT="/search_engine"
ENV MEILISEARCH_VERSION="0.28.1"
ENV MEILISEARCH_HOST="0.0.0.0"
ENV MEILISEARCH_PORT="7700"
ENV MEILISEARCH_URL="http://$MEILISEARCH_HOST:$MEILISEARCH_PORT"

ENV MEILI_HTTP_ADDR="$MEILISEARCH_HOST:$MEILISEARCH_PORT"
ENV MEILI_DB_PATH="$MEILISEARCH_ROOT/data"
ENV MEILI_LOG_LEVEL="info"

ENV MEILISEARCH_DOCUMENTS_INDEX="og_docs_search"
ENV MEILISEARCH_KEYWORDS_INDEX="og_keywords_search"


# init flask api
WORKDIR $BACKEND_ROOT
ADD ./backend $BACKEND_ROOT


# install requirements
RUN python -m pip install --upgrade pip
RUN python -m pip install -r "$BACKEND_ROOT/requirements.txt"


# init meilisearch
WORKDIR $MEILISEARCH_ROOT
ADD ./search_engine $MEILISEARCH_ROOT


# install prerequisite apt apps
RUN apt-get update && \
    apt-get install --no-install-recommends -y curl wget ca-certificates


# download meilisearch binary
RUN wget -O meilisearch "https://github.com/meilisearch/meilisearch/releases/download/v${MEILISEARCH_VERSION}/meilisearch-linux-amd64" && \
    chmod +x meilisearch


# expose port for both meilisearch and flask
# expose 5000 7700

# expose port for flask
expose 5000


# add entrypoint script
WORKDIR /
ADD ./deployment/backend_and_search_engine.entrypoint.sh /entrypoint.sh


ENTRYPOINT ["/bin/bash", "-c", "/entrypoint.sh"]


# Reference
# https://github.com/mukul-mehta/MeiliSearch-Arm64-Docker/blob/main/Dockerfile
