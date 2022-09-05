#!/bin/bash


# fix the issue:
# "Meilisearch failed to infer the version of the database.
#  Please consider using a dump to load your data."
if [[ ! -f "$MEILI_DB_PATH/VERSION" ]]; then
   echo "$MEILISEARCH_VERSION" > "$MEILI_DB_PATH/VERSION"
fi


# run meilisearch engine
"$MEILISEARCH_ROOT/meilisearch" &


# run API server
python "$BACKEND_ROOT/meilisearch_api.py" &


# wait for servers started
while ! timeout 0.5 bash -c "echo > /dev/tcp/$FLASK_HOST/$FLASK_PORT"; do
	sleep 1;
done

while ! timeout 0.5 bash -c "echo > /dev/tcp/$MEILISEARCH_HOST/$MEILISEARCH_PORT"; do
	sleep 1;
done


# create indexes
# update indexes settings
# $MEILISEARCH_DOCUMENTS_INDEX and $MEILISEARCH_KEYWORDS_INDEX

status_code=$(
    curl --write-out %{http_code} \
         --silent \
         --output /dev/null \
         "$MEILISEARCH_HOST:$MEILISEARCH_PORT/indexes/$MEILISEARCH_DOCUMENTS_INDEX"
)
attempts=5
until [[ $attempts == 0 ]]; do
    [[ $status_code == 200 ]] && break;
    [[ $attempts -gt 0 ]] && ((--attempts));
    [[ $attempts -gt 0 ]] && sleep 1;
done

if [[ $status_code != 200 ]]; then

    curl -XPOST "$MEILISEARCH_URL/indexes" \
         -H 'Content-Type: application/json' \
         --data-binary '{
             "uid": "'$MEILISEARCH_DOCUMENTS_INDEX'",
             "primaryKey": "uuid"
         }'

    curl -XPATCH "$MEILISEARCH_URL/indexes/$MEILISEARCH_DOCUMENTS_INDEX/settings" \
         -H 'Content-Type: application/json' \
         -d "@$MEILISEARCH_ROOT/resources/docs.settings.json"

fi


status_code=$(
    curl --write-out %{http_code} \
         --silent \
         --output /dev/null \
         "$MEILISEARCH_HOST:$MEILISEARCH_PORT/indexes/$MEILISEARCH_KEYWORDS_INDEX"
)
attempts=5
until [[ $attempts == 0 ]]; do
    [[ $status_code == 200 ]] && break;
    [[ $attempts -gt 0 ]] && ((--attempts));
    [[ $attempts -gt 0 ]] && sleep 1;
done

if [[ $status_code != 200 ]]; then

    curl -XPOST "$MEILISEARCH_URL/indexes" \
         -H 'Content-Type: application/json' \
         --data-binary '{
             "uid": "'$MEILISEARCH_KEYWORDS_INDEX'",
             "primaryKey": "uuid"
         }'

    curl -XPATCH "$MEILISEARCH_URL/indexes/$MEILISEARCH_KEYWORDS_INDEX/settings" \
         -H 'Content-Type: application/json' \
         -d "@$MEILISEARCH_ROOT/resources/keywords.settings.json"

fi


# Wait for any process to exit
wait -n


# Exit with status of process that exited first
exit $?


# Reference
# https://docs.docker.com/config/containers/multi-service_container/
# https://unix.stackexchange.com/questions/5277/how-do-i-tell-a-script-to-wait-for-a-process-to-start-accepting-requests-on-a-po
# https://stackoverflow.com/questions/2220301/how-to-evaluate-http-response-codes-from-bash-shell-script
