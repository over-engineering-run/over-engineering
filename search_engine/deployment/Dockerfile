FROM --platform=linux/amd64 debian:stable-slim
LABEL maintainer="tainvecs@gmail.com"


# env
ENV MEILISEARCH_VERSION="0.28.1"
ENV MEILISEARCH_ROOT="/search_engine"

ENV MEILI_HTTP_ADDR="0.0.0.0:7700"
ENV MEILI_DB_PATH="$MEILISEARCH_ROOT/data.ms"
ENV MEILI_LOG_LEVEL="info"

ENV MEILISEARCH_DOCUMENTS_INDEX="og_docs_search"
ENV MEILISEARCH_KEYWORDS_INDEX="og_keywords_search"


# init
WORKDIR $MEILISEARCH_ROOT


# install prerequisite apt apps
RUN apt-get update && \
    apt-get install --no-install-recommends -y wget ca-certificates


# download meilisearch binary
RUN wget -O meilisearch "https://github.com/meilisearch/meilisearch/releases/download/v${MEILISEARCH_VERSION}/meilisearch-linux-amd64" && \
    chmod +x meilisearch


# expose port for meilisearch
expose 7700


ENTRYPOINT ["/search_engine/meilisearch"]


# Reference
# https://github.com/mukul-mehta/MeiliSearch-Arm64-Docker/blob/main/Dockerfile
