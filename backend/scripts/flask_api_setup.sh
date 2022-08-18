BACKEND_ROOT="$(dirname $(cd $(dirname $0) >/dev/null 2>&1; pwd -P;))"

python -m pip install --upgrade pip
python -m pip install -r "$BACKEND_ROOT/requirements.txt"
