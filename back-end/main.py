import uuid
import os
from utils import app
from flask import Response
from auth import login_required
from flask import abort, g, request
from graphdb import *
from tasks import *
from tools import *
from data import *
from folders import *
from groups import *
import json

# MARK: - API

@app.route("/healthz")
def health():
    return Response(status=200)

# MARK: - Sharing

@app.route('/api/entities/<id>/accesslist/', methods=['POST'])
@login_required
def share_entity(id):
    data = request.get_json(force=True)
    if str(data["entity"]["id"]) != id:
        abort(400)
    else: 
        node = validate_ownership(g.user["email"], data["entity"]["id"])
        if node is not None:
            if "email" in data:
                existent_rel = validate_access(data["email"], data["permission"], data["entity"]["id"])
                if existent_rel is None:
                    add_permission(data["entity"]["id"], data["email"], data["permission"])
                return Response()
            elif "groupId" in data:
                existent_rel = validate_access(data["groupId"], data["permission"], data["entity"]["id"])
                if existent_rel is None:
                    add_permission_group(data["entity"]["id"], data["groupId"], data["permission"])
                return Response()
            else:
                abort(400)
        else:
            abort(404)

@app.route('/api/entities/<id>/path/', methods=['PATCH'])
@login_required
def move_entity(id):
    abort(500)

@app.route('/api/entities/<id>/path/', methods=['GET'])
@login_required
def entity_path(id):
    validate_access(g.user["email"], OPERATION_READ, id)
    return json.dumps({"path": get_entity_path(id)})

@app.route('/api/groups/<id>/accesslist/', methods=['POST'])
@login_required
def share_group(id):
    data = request.get_json(force=True)
    if str(data["group"]["id"]) != id:
        abort(400)
    else:
        node = validate_ownership(g.user["email"], data["group"]["id"])
        if node is not None:
            existent_rel = validate_membership(data["email"], data["group"]["id"])
            if existent_rel is None:
                add_member(data["email"], data["group"]["id"])
            return Response()
        else:
            abort(404)

if __name__ == "__main__":
    app.run('0.0.0.0', 5000)