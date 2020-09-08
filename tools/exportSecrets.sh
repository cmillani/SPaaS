#!/bin/bash

DIR="$( cd "$( dirname "$0" )" >/dev/null 2>&1 && pwd )"

mkdir -p $DIR/../secrets

for VARIABLE in $KUBE_SECRETS
do
    VALUE=${!VARIABLE} 
    if [ -n "$VALUE" ]; then
        echo -n $VALUE > $DIR/../secrets/$VARIABLE
        SECRET_NAME=$(echo ${VARIABLE,,} | sed s/_/-/g)
        kubectl create secret generic $SECRET_NAME --from-file=$DIR/../secrets/$VARIABLE
    fi
done
