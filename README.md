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