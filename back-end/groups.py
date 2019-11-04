from flask import g, Response, request, abort
from auth import *
from utils import app
import requests 
from graphdb import *
from bson.json_util import dumps
import json

@app.route("/api/groups/", methods=['POST'])
@login_required
def create_group():
    data = request.get_json(force=True)
    create_group_node(data["name"], g.user["email"])
    return "Ok"

@app.route("/api/groups/", methods=['GET'])
@login_required
def list_groups():
    groups = []
    for node in get_groups(g.user["email"]):
        groups.append({"id": node.id, "name": node["name"]})
    return json.dumps(groups)

@app.route("/api/groups/<id>/", methods=['DELETE'])
@login_required
def delete_group(id):
    node = validate_ownership(g.user["email"], id)
    if node is not None:
        delete_entity_and_paths(id)
        return 'Deleted'
    else:
        abort(403)