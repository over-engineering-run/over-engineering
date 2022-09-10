NLP_ROOT="$(dirname $(cd $(dirname $0) >/dev/null 2>&1; pwd -P;))"

python $NLP_ROOT/pipeline_update_from_dump.py \
       --flask_url $FLASK_URL \
       --input $NLP_ROOT/output/pipeline_info.json
