#!/bin/bash

DIR="$( cd "$( dirname "$0" )" >/dev/null 2>&1 && pwd )"

source ${DIR}/secrets.sh

# MongoDB Connection URL
export SPASS_CONNECTION_STRING=mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@127.0.0.1:27017
# Celery Broker Connection URL
export SPASS_CELERY_BROKER=redis://localhost

# Blob mechanism to be used
# See option on Docs
export BLOB_MECHANISM=minio

# Minio Blob Mechanism Variables
export MINIO_ENDPOINT=127.0.0.1:9000

# Neo4J Variales
export GRAPHDB_CONNECTION_STRING=bolt://localhost:7687

# Front Server
export FRONT_ENDPOINT=http://localhost:4200

# Auth server
export AUTHAPI_ENDPOINT=http://localhost:3000
export EXPOSED_AUTHAPI_ENDPOINT=http://localhost:3000

