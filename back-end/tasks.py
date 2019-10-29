from flask import g, Response, request, abort
from auth import *
from utils import *
from graphdb import *
from celeryActions import *
from bson.json_util import dumps
from blobActions import *
import json

@app.route("/api/tasks/submit/", methods=['POST'])
@login_required
def submit_task():
    data = request.get_json(force=True)
    data_node = validate_access(g.user["email"], OPERATION_READ, data['data'])
    tool_node = validate_access(g.user["email"], OPERATION_READ, data['tool'])
    if data_node is not None and tool_node is not None:
        submit_celery.delay(tool_node["blob"], data_node["blob"], data['args'], g.user["email"])
        return "SUCCESS"
    else:
        abort(401)

@app.route("/api/results/", methods=['GET'])
@login_required
def get_jobs_results():
    nodes = []
    for node in list_user_nodes(g.user["email"], "Result"):
        nodes.append({"id": node.id, "name": node["name"]})
    return json.dumps(nodes)

@app.route("/api/status/", methods=['GET'])
@login_required
def get_jobs_status():
    all_status = db_client.statusCollection.find({'owner': g.user["email"]})
    return Response(dumps(all_status),status=200)

@app.route("/api/results/<id>/file/", methods=['GET'])
@login_required
def get_job_result_file(id):
    node = validate_access(g.user["email"], OPERATION_READ, id)
    if node is not None:
        return Response(blobMechanism.download_blob('seismic-results', node["blob"]))
    else:
        abort(401)

@app.route("/api/results/<id>/", methods=['DELETE'])
@login_required
def delete_result(id):
    node = validate_access(g.user["email"], OPERATION_WRITE, id)
    if node is not None:
        delete_blob(node["blob"], 'seismic-tools')
        db_client.resultsCollection.delete_one({'_id': ObjectId(node["mongoid"])})
        delete_entity_and_paths(id)
        return "Ok"
    else:
        abort(401)

@app.route("/api/results/<id>/", methods=['GET'])
@login_required
def get_job_result(id):
    node = validate_access(g.user["email"], OPERATION_READ, id)
    if node is not None:
        result = db_client.resultsCollection.find_one({'_id': ObjectId(node['mongoid'])})
        return Response(dumps(result))
    else:
        abort(401)