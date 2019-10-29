from flask import g, Response, request, abort
from auth import *
from utils import *
import requests 
from graphdb import *
from celeryActions import *
from bson.json_util import dumps
from blobActions import *
import json

@app.route("/api/folders/", methods=['POST'])
@login_required
def create_folder():
    data = request.get_json(force=True)
    create_folder(data["name"], g.user["email"])
    return "Ok"

@app.route("/api/folders/", methods=['GET'])
@login_required
def list_folders():
    folders = []
    for node in get_folders(g.user["email"]):
        folders.append({"id": node.id, "name": node["name"]})
    return json.dumps(folders)

@app.route("/api/folders/<id>/", methods=['DELETE'])
def delete_folder(id):
    node = validate_ownership(g.user["email"], id)
    if node is not None:
        delete_entity_and_paths(id)
        return 'Deleted'
    else:
        abort(401)