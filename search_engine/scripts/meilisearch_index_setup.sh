SEARCH_ENGINE_ROOT="$(dirname $(cd $(dirname $0) >/dev/null 2>&1; pwd -P;))"


# --------------------------------------------------------------------
#
# create indexes
#
# $MEILISEARCH_DOCUMENTS_INDEX and $MEILISEARCH_KEYWORDS_INDEX
#
# --------------------------------------------------------------------


curl -XPOST "$MEILISEARCH_URL/indexes" \
     -H 'Content-Type: application/json' \
     --data-binary '{
         "uid": "'$MEILISEARCH_DOCUMENTS_INDEX'",
         "primaryKey": "href"
     }'


curl -XPOST "$MEILISEARCH_URL/indexes" \
     -H 'Content-Type: application/json' \
     --data-binary '{
         "uid": "'$MEILISEARCH_KEYWORDS_INDEX'",
         "primaryKey": "keywords"
     }'


# --------------------------------------------------------------------
#
# update indexes settings
#
# $MEILISEARCH_DOCUMENTS_INDEX and $MEILISEARCH_KEYWORDS_INDEX
#
# --------------------------------------------------------------------


curl -XPATCH "$MEILISEARCH_URL/indexes/$MEILISEARCH_DOCUMENTS_INDEX/settings" \
     -H 'Content-Type: application/json' \
     -d"@$SEARCH_ENGINE_ROOT/resources/docs.settings.json"


curl -XPATCH "$MEILISEARCH_URL/indexes/$MEILISEARCH_KEYWORDS_INDEX/settings" \
     -H 'Content-Type: application/json' \
     -d"@$SEARCH_ENGINE_ROOT/resources/keywords.settings.json"
