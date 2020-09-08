#!/bin/bash

DIR="$( cd "$( dirname "$0" )" >/dev/null 2>&1 && pwd )"

mkdir -p $DIR/../secrets

for VARIABLE in $KUBE_SECRETS
do
    VALUE=${!VARIABLE} 
    if [ -n "$VALUE" ]; then
        echo $VALUE >> $DIR/../secrets/$VARIABLE
    fi
done