# SPaaS

Seismic processing as a service (SPaaS) makes it easier for people to run their really heavy seismic workloads on Cloud Computing Plataforms.

# Configuration

Create a copy of *tools/config.sh.example* 
Edit *tools/config.sh*, changing all connection urls and execute the command
Also copy *tools/secrets.sh.example* and substitute the values

```sh
source tools/config.sh
```

Generate needed keys and certificates (see makefile)

The available options for the **blob mechanism** are:

* minio
* azure - _note, this configuration was removed since it is not being used, to enable it again the backend requirements.txt file should be updated to include needed azure packages_

Also, make sure to generate new keys for *auth-server/keystore.json*, that can be done running *auth-server/generateKeys.js*.
The provided keys sould not ne used on a deployed instance of this sevice.

# Running

## Kubernetes
**This is a WIP, and should become the default deployment method. For now it will only be a development evironment**
With kubectl and minikube installed and running:

```sh
source tools/config.sh
docker-compose build
```

The process described above may fail (VM may not have enough memory to run NPM, for instance), and also requires setting  `PullPolicy` to `Never`.
Another option is to use a locl repository, as described bellow.

Enable the repository addon if not enabled, and if using minikube start using `--insecure-registry`

Then add the project images (remote images k8s can pull, so we can push only the project ones) to the k8s repository: (see [this link](https://minikube.sigs.k8s.io/docs/handbook/registry/) for more information)

```sh
docker image tag <image> localhost:5000/<image> #registry addon must be enabled and exposed, see link above
docker push localhost:5000/<image>
```

This requires setting image on `deployments` to `localhost:5000/<image>`.

### Setting up secrets
Create the `.env` files from the provided `.env.sample` on `k8s/dev`, and run `make localKubeKeys`.
Then, simply run `kubectl apply -k k8s/dev`

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
