from utils import app, blobMechanism
from auth import login_required
from flask import request, Response, g, abort
from blobActions import upload_to_azure, delete_blob
import json
from graphdb import *
import uuid

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
        abort(403)

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
        abort(403)
    