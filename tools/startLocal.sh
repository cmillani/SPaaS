#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

source ${DIR}/config.sh

npm start --prefix ${DIR}/../front-end &
python ${DIR}/../back-end/main.py &
celery worker --workdir=../back-end/ -A main.celery -l info &

wait