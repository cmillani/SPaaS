import requests 
import jwt
from functools import wraps
from flask import abort, g, Flask, request, Response
import json
import pymongo
from flask_cors import CORS
from bson.json_util import dumps, loads
from bson.objectid import ObjectId
import os
from celery import Celery
import subprocess
import uuid
from Mechanisms.Blob.BlobMechanismFactory import BlobMechanismFactory

app = Flask(__name__)
CORS(app)

db_client = pymongo.MongoClient(os.environ['SPASS_CONNECTION_STRING']).spassDatabase

blobMechanism = BlobMechanismFactory.getMechanism()

celery = Celery(app.name, broker=os.environ['SPASS_CELERY_BROKER'], backend=os.environ['SPASS_CELERY_BROKER'])

authapi_endpoint = "http://localhost:3000"

def validate_token(token):
    data = {'token': token, 'client_id': "spaas"}
    validated_token = requests.post(url = authapi_endpoint + "/token/introspection", data = data).json()
    if validated_token["active"]:
        return
    else:
        abort(401)

def retrieve_user(user_id):
    user = db_client.usersCollection.find_one({'_id': ObjectId(user_id)}, {'password': False})
    if user:
        return user
    else:
        abort(401)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if auth_header:
            # Retrieves and then validates the user token
            token = auth_header.split(" ")[1]
            validate_token(token)
            decoded_token = jwt.decode(token, verify=False)
            user = retrieve_user(decoded_token["sub"])
            # All validated and user retrieved, saves data to request information
            g.token = token
            g.user = user
        else:
            abort(401)
        return f(*args, **kwargs)
    return decorated_function

@celery.task
def submit_celery(tool_name, data_name, args):
    file_id = str(uuid.uuid4())
    db_client.statusCollection.insert_one({'status': 'Executing', 'job_id': file_id})
    blobMechanism.get_blob_to_path('seismic-tools', tool_name, tool_name)
    blobMechanism.get_blob_to_path('seismic-data', data_name, data_name)
    
    cmd_args = ''
    for i in range(1, len(args) + 1):
        cmd_args = cmd_args + ' ' + args[str(i)]
    
    os.system('chmod +x ' + tool_name)

    total_cmd = './' + tool_name + cmd_args
    
    os.system(total_cmd)
    os.system('rm -rf ' + tool_name + ' ' + data_name)
    file_name = file_id + '.tar.gz'
    os.system('tar -czvf ' + file_name+ ' *.su')
    blobMechanism.create_blob_from_path('seismic-results', file_name, file_name)
    os.system('rm -rf *.su ' + file_name)

    data_register = {}
    data_register['tool'] = tool_name
    data_register['data'] = data_name
    data_register['args'] = args
    data_register['id'] = file_id
    db_client.resultsCollection.insert_one(data_register)

    db_client.statusCollection.update({'job_id': file_id}, {'$set': { 'status': 'Executed'}})
    
    return

@app.route("/healthz")
def health():
    return Response(status=200)

@app.route("/api/tasks/parameters/<tool_name>/", methods=['GET'])
@login_required
def get_parameters(tool_name):
    result = db_client.toolsCollection.find_one({"name": tool_name})
    return Response(dumps(result["args"]), status=200)

@app.route("/api/tasks/submit/", methods=['POST'])
@login_required
def submit_task():
    data = request.get_json(force=True)
    submit_celery.delay(data['tool'], data['data'], data['args'])
    return "SUCCESS"

@app.route("/api/results/")
@login_required
def get_jobs_results():
    all_results = db_client.resultsCollection.find({})
    return Response(dumps(all_results),status=200)

@app.route("/api/status/")
@login_required
def get_jobs_status():
    all_status = db_client.statusCollection.find({})
    return Response(dumps(all_status),status=200)

@app.route("/api/results/<id>")
@login_required
def get_job_results(id):
    raise NotImplementedError()

@app.route('/api/data/upload/', methods=['POST'])
@login_required
def upload_data():
    data = request.files.items()
    for d in data:
        data_name = d[0]
        data_content = d[1]
    
    upload_to_azure(data_name,'seismic-data',data_content)
    return "Uploaded"

@app.route('/api/data/', methods=['GET'])
@login_required
def get_files_blob():
    return json.dumps(list_files('seismic-data'))

def upload_to_azure(data_name, container_name, data_content):
    data_content.save(data_name)
    blobMechanism.create_blob_from_path(container_name, data_name, data_name)
    os.system('rm -rf '+ data_name)

@app.route('/api/tools/', methods=['GET'])
@login_required
def get_tools_blob():
    return json.dumps(list_files('seismic-tools'))

def list_files(container_name):
    data = blobMechanism.list_blobs(container_name)
    all_names = [d.name for d in data]
    return all_names

@app.route('/api/tools/upload/', methods=['POST'])
@login_required
def upload_tool():
    data = request.files.items()
    arguments = request.form
    
    for d in data:
        data_name = d[0]
        data_content = d[1]
    
    upload_to_azure(data_name, 'seismic-tools', data_content)
    
    for a in arguments.items():
        all_arguments = a[1]

    splited = all_arguments.split(',')
    
    tool_document = {}
    tool_document['name'] = data_name
    tool_document['args'] = []
    
    for p in splited:
        name, description = p.split(':')
        new_arg = {}
        new_arg['name'] = name
        new_arg['description'] = description
        tool_document['args'].append(new_arg)
    
    db_client.toolsCollection.insert_one(tool_document)
    
    return 'Uploaded'

@app.route('/api/tools/<name>/', methods=['DELETE'])
@login_required
def delete_tool(name):
    delete_blob(name, 'seismic-tools')
    return 'Deleted'

@app.route('/api/data/<name>/', methods=['DELETE'])
@login_required
def delete_data(name):
    delete_blob(name, 'seismic-data')
    return 'Deleted'

def delete_blob(blob_name, container_name):
    blobMechanism.delete_blob(container_name, blob_name)

if __name__ == "__main__":
    app.run('0.0.0.0', 5000)