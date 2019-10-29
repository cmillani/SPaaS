import os
import pymongo
from flask import abort, g, Flask, request, Response
from Mechanisms.Blob.BlobMechanismFactory import BlobMechanismFactory
from flask_cors import CORS
from celery import Celery

app = Flask(__name__)

db_client = pymongo.MongoClient(os.environ['SPASS_CONNECTION_STRING']).spassDatabase

CORS(app)

blobMechanism = BlobMechanismFactory.getMechanism()

celery = Celery(app.name, broker=os.environ['SPASS_CELERY_BROKER'], backend=os.environ['SPASS_CELERY_BROKER'])