#!/bin/bash


# run API server
python "$BACKEND_ROOT/meilisearch_api.py" &


# run meilisearch engine
"$MEILISEARCH_ROOT/meilisearch" &


# wait for servers started
while ! timeout 0.5 bash -c "echo > /dev/tcp/$MEILISEARCH_HOST/$MEILISEARCH_PORT"; do
	sleep 1;
done

while ! timeout 0.5 bash -c "echo > /dev/tcp/$FLASK_HOST/$FLASK_PORT"; do
	sleep 1;
done


# create indexes
# $MEILISEARCH_DOCUMENTS_INDEX and $MEILISEARCH_KEYWORDS_INDEX

curl -XPOST "$MEILISEARCH_URL/indexes" \
     -H 'Content-Type: application/json' \
     --data-binary '{
         "uid": "'$MEILISEARCH_DOCUMENTS_INDEX'",
         "primaryKey": "uuid"
     }'

curl -XPOST "$MEILISEARCH_URL/indexes" \
     -H 'Content-Type: application/json' \
     --data-binary '{
         "uid": "'$MEILISEARCH_KEYWORDS_INDEX'",
         "primaryKey": "uuid"
     }'


# update indexes settings
# $MEILISEARCH_DOCUMENTS_INDEX and $MEILISEARCH_KEYWORDS_INDEX

curl -XPATCH "$MEILISEARCH_URL/indexes/$MEILISEARCH_DOCUMENTS_INDEX/settings" \
     -H 'Content-Type: application/json' \
     -d "@$MEILISEARCH_ROOT/resources/docs.settings.json"


curl -XPATCH "$MEILISEARCH_URL/indexes/$MEILISEARCH_KEYWORDS_INDEX/settings" \
     -H 'Content-Type: application/json' \
     -d "@$MEILISEARCH_ROOT/resources/keywords.settings.json"


# Wait for any process to exit
wait -n


# Exit with status of process that exited first
exit $?


# Reference
# https://docs.docker.com/config/containers/multi-service_container/
# https://unix.stackexchange.com/questions/5277/how-do-i-tell-a-script-to-wait-for-a-process-to-start-accepting-requests-on-a-po
