# SPaaS

Seismic processing as a service (SPaaS) makes it easier for people to run their really heavy seismic workloads on Cloud Computing Plataforms.

# Configuration

Create a copy of *tools/config.sh.example* 
Edit *tools/config.sh*, changing all connection urls and execute the command

```sh
source config.sh
```

The available options for the **blob mechanism** are:

* minio
* azure

# Running

## With Docker

Be sure to have `docker` `docker compose` installed and configured, and simply execute 

```sh
docker-compose up
``` 

on the root folder of the project.

## Without Docker
**This option is not recommended since the stack for the SPaaS requires a list with many services.**

Be sure to execute `npm install` on */front-end* and then execute the script */tools/startLocal.sh* to setup a local environment.

In order to run locally, you must have the following servers running locally and configured on */tools/config.sh*:

* redis
* minio
* mongodb

and the following installed:

* python3
* npm
* celery