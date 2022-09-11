NLP_ROOT="$(dirname $(cd $(dirname $0) >/dev/null 2>&1; pwd -P;))"

python "$NLP_ROOT/pipeline_runner.py" \
       --flask_url $FLASK_URL \
       --parallel_n 6 \
       --batch_size 100 \
       --nlp_root $NLP_ROOT \
       --config "$NLP_ROOT/config/pipeline.yaml" \
       --start 0 \
       --limit -1
