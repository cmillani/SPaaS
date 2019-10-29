import uuid
import os
from utils import app
from flask import Response
from auth import login_required
from flask import abort, g, request
from graphdb import validate_ownership, validate_access, add_permission
from tasks import *
from tools import *
from data import *
from folders import *
from groups import *

# MARK: - API

@app.route("/healthz")
def health():
    return Response(status=200)

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

if __name__ == "__main__":
    app.run('0.0.0.0', 5000)