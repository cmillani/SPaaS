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
from neo4j import GraphDatabase

app = Flask(__name__)
graphDb = GraphDatabase.driver(os.environ['GRAPHDB_CONNECTION_STRING'])
CORS(app)

db_client = pymongo.MongoClient(os.environ['SPASS_CONNECTION_STRING']).spassDatabase

blobMechanism = BlobMechanismFactory.getMechanism()

celery = Celery(app.name, broker=os.environ['SPASS_CELERY_BROKER'], backend=os.environ['SPASS_CELERY_BROKER'])

authapi_endpoint = os.environ['AUTHAPI_ENDPOINT']

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

# MARK: - Tasks

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

# MARK: - Data

@app.route('/api/data/', methods=['POST'])
@login_required
def upload_data():
    data = request.files.items()
    for d in data:        
        data_name = d[0]
        data_blob_name = data_name + str(uuid.uuid4())
        data_content = d[1]
    
    upload_to_azure(data_blob_name, 'seismic-data', data_content)
    create_blob_node(g.user["email"], data_name, "Data", data_blob_name)

    return "Uploaded"

@app.route('/api/data/<id>/', methods=['GET'])
@login_required
def get_data_id(id):
    node = validate_access(g.user["email"], OPERATION_READ, id)
    if node is not None:
        return Response(blobMechanism.download_blob('seismic-data', node["blob"]))
    else:
        abort(401)

@app.route('/api/data/', methods=['GET'])
@login_required
def get_files_blob():
    nodes = []
    for node in list_user_nodes(g.user["email"], "Data"):
        nodes.append({"id": node.id, "name": node["name"]})
    return json.dumps(nodes)
    
@app.route('/api/data/<id>/', methods=['DELETE'])
@login_required
def delete_data(id):
    node = validate_access(g.user["email"], OPERATION_WRITE, id)
    if node is not None:
        delete_blob(node["blob"], 'seismic-data')
        delete_entity_and_paths(id)
        return 'Deleted'
    else:
        abort(401)
    

# MARK: - Tools

@app.route("/api/tools/<id>/parameters/", methods=['GET'])
@login_required
def get_parameters(id):
    node = validate_access(g.user["email"], OPERATION_READ, id)
    if node is not None:
        result = db_client.toolsCollection.find_one({'_id': ObjectId(node['mongoid'])})
        return Response(dumps(result["args"]), status=200)
    else:
        abort(401)

@app.route('/api/tools/', methods=['GET'])
@login_required
def get_tools_blob():
    nodes = []
    for node in list_user_nodes(g.user["email"], "Tool"):
        nodes.append({"id": node.id, "name": node["name"], "args": node["parameters"]})
    return json.dumps(nodes)

@app.route('/api/tools/', methods=['POST'])
@login_required
def upload_tool():
    data = request.files.items()
    arguments = request.form
    
    # Retrieve blob data

    for d in data:
        data_name = d[0]
        data_blob_name = data_name + str(uuid.uuid4())
        data_content = d[1]
    
    # Retrieve DB Data
    
    all_arguments = ""
    for a in arguments.items():
        all_arguments = a[1]

    splited = all_arguments.split(',')
    
    tool_document = {}
    tool_document['name'] = data_name
    tool_document['blob_name'] = data_blob_name
    tool_document['args'] = []
    
    for p in splited:
        name, description = p.split(':')
        new_arg = {}
        new_arg['name'] = name
        new_arg['description'] = description
        tool_document['args'].append(new_arg)
    
    upload_to_azure(data_blob_name, 'seismic-tools', data_content)
    result = db_client.toolsCollection.insert_one(tool_document)
    create_tool_node(g.user["email"], data_name, "Tool", data_blob_name, str(result.inserted_id))

    return "Uploaded"

@app.route('/api/tools/<id>/', methods=['DELETE'])
@login_required
def delete_tool(id):
    node = validate_access(g.user["email"], OPERATION_WRITE, id)
    if node is not None:
        delete_blob(node["blob"], 'seismic-tools')
        db_client.toolsCollection.delete_one({'_id': ObjectId(node["mongoid"])})
        delete_entity_and_paths(id)
        return 'Deleted'
    else:
        abort(401)

# MARK: - Sharing

@app.route('/api/entity/accesslist/', methods=['POST'])
@login_required
def share_entity():
    data = request.get_json(force=True)
    node = validate_ownership(g.user["email"], data["entity"]["id"])
    if node is not None:
        existent_rel = validate_access(data["email"], data["permission"], data["entity"]["id"])
        if existent_rel is None:
            add_permission(data["entity"]["id"], data["email"], data["permission"])
        return Response()
    else:
        abort(404)


# MARK: - Blob methods

def upload_to_azure(data_name, container_name, data_content):
    data_content.save(data_name)
    blobMechanism.create_blob_from_path(container_name, data_name, data_name)
    os.system('rm -rf '+ data_name)

def delete_blob(blob_name, container_name):
    blobMechanism.delete_blob(container_name, blob_name)

def list_files(container_name):
    data = blobMechanism.list_blobs(container_name)
    all_names = [d.name for d in data]
    return all_names

# MARK: - Graph DB

OPERATION_READ = 1
OPERATION_WRITE = 10

def create_blob_node(owner, name, data_type, blob_name):
    def _create_node(tx):
        tx.run("MERGE (p:Person {email: {uemail}}) "
                "CREATE (d:" + data_type + " {name: {dataname}, blob: {blobname}}) "
                "CREATE (p)-[:OWNS]->(d)", uemail=owner, dataname=name, blobname=blob_name)

    with graphDb.session() as session:
        session.write_transaction(_create_node)

def create_tool_node(owner, name, data_type, blob_name, mongoid):
    def _create_node(tx):
        tx.run("MERGE (p:Person {email: {uemail}}) "
                "CREATE (d:" + data_type + " {name: {dataname}, blob: {blobname}, mongoid: {id}}) "
                "CREATE (p)-[:OWNS]->(d)", uemail=owner, dataname=name, blobname=blob_name, id=mongoid)

    with graphDb.session() as session:
        session.write_transaction(_create_node)

def list_user_nodes(user, data_type):
    def _list_nodes(tx):
        return tx.run("MATCH (user:Person {email: {uemail} })"
                        "MATCH (user)-[:OWNS|MEMBER|PERMISSION*]->(entity:" + data_type + ")"
                        "RETURN entity", uemail=user)
    with graphDb.session() as session:
        return session.read_transaction(_list_nodes).graph().nodes

def validate_access(user, type, node_id):
    def _validate_access(tx):
        return tx.run("MATCH (user:Person {email: {uemail}}) "
                        "MATCH (target) WHERE id(target) = {id} "
                        "MATCH p = (user)-[:OWNS|MEMBER|PERMISSION*]->(target) "
                        "WHERE all(rel in relationships(p) WHERE rel.level IS NULL OR rel.level >= {level}) "
                        "RETURN target", uemail=user, id=int(node_id), level=type)
    with graphDb.session() as session:
        nodes = session.read_transaction(_validate_access).graph().nodes
        target_node = None
        for node in nodes:
            target_node = node
            break
        return target_node

def delete_entity_and_paths(entity_id):
    def _delete_paths(tx):
        tx.run("MATCH (entity) WHERE id(entity) = {id} "
                "MATCH ()-[rel]-(entity) "
                "DELETE rel, entity", id=int(entity_id))
    with graphDb.session() as session:
        session.write_transaction(_delete_paths)

def validate_ownership(email, entity_id):
    def _validate_ownership(tx):
        return tx.run("MATCH (user:Person {email: {uemail}}) "
                        "MATCH (target) WHERE id(target) = {id} "
                        "MATCH (user)-[:OWNS]->(target) "
                        "RETURN target", uemail=email, id=int(entity_id))
    with graphDb.session() as session:
        nodes = session.read_transaction(_validate_ownership).graph().nodes
        target_node = None
        for node in nodes:
            target_node = node
            break
        return target_node

def add_permission(entity_id, user_email, permission):
    def _add_permission(tx):
        tx.run("MATCH (user:Person {email: {uemail}}) "
                "MATCH (entity) WHERE id(entity) = {id} "
                "CREATE (user)-[:PERMISSION {level: {permission}}]->(entity) ", 
                uemail=user_email, id=int(entity_id), permission=permission)
    with graphDb.session() as session:
        session.write_transaction(_add_permission)

if __name__ == "__main__":
    app.run('0.0.0.0', 5000)