# SPaaS

Seismic processing as a service (SPaaS) makes it easier for people to run their really heavy seismic workloads on Cloud Computing Plataforms.

# Configuration

Create a copy of *tools/config.sh.example* 
Edit *tools/config.sh*, changing all connection urls and execute the command
Also copy *tools/secrets.sh.example* and substitute the values

```sh
source config.sh
```

Generate needed keys and certificates (see makefile)

The available options for the **blob mechanism** are:

* minio
* azure - _note, this configuration was removed since it is not being used, to enable it again the backend requirements.txt file should be updated to include needed azure packages_

Also, make sure to generate new keys for *auth-server/keystore.json*, that can be done running *auth-server/generateKeys.js*.
The provided keys sould not ne used on a deployed instance of this sevice.

# Running

## With Docker

Be sure to have `docker` `docker compose` installed and configured, and simply execute 

```sh
docker-compose up
``` 

Use the additional _yaml_ files to specify the environment:
```sh
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```
The command above uses additional configuration on the _dev_ yaml to expose additional ports, for example.

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
