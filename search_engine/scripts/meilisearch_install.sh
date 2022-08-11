SEARCH_ENGINE_ROOT="$(dirname $(cd $(dirname $0) >/dev/null 2>&1; pwd -P;))"

# install meilisearch
cd "$SEARCH_ENGINE_ROOT/bin"
curl -L https://install.meilisearch.com | sh
