import os
from flask import abort, g, Flask, request, Response
import jwt
import requests 
from utils import *
from functools import wraps
from bson.objectid import ObjectId

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