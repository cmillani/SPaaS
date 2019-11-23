from utils import app, db_client, blobMechanism
from bson.json_util import dumps
from graphdb import *
from auth import login_required
from flask import g, Response, request, abort
from bson.objectid import ObjectId
import uuid
import json
from blobActions import *

@app.route("/api/tools/<id>/parameters/", methods=['GET'])
@login_required
def get_parameters(id):
    node = validate_access(g.user["email"], OPERATION_READ, id)
    if node is not None:
        result = db_client.toolsCollection.find_one({'_id': ObjectId(node['mongoid'])})
        return Response(dumps(result["args"]), status=200)
    else:
        abort(403)

@app.route('/api/tools/', methods=['GET'])
@login_required
def get_tools_blob():
    nodes = []
    for node in list_user_nodes(g.user["email"], "Tool"):
        nodes.append({"id": node.id, "name": node["name"]})
    return json.dumps(nodes)

@app.route('/api/tools/<id>/', methods=['GET'])
@login_required
def get_tool_blob(id):
    node = validate_access(g.user["email"], OPERATION_READ, id)
    if node is not None:
        return Response(blobMechanism.download_blob('seismic-tools', node["blob"]))
    else:
        abort(403)

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
        abort(403)