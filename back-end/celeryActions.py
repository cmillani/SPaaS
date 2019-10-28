import pymongo
from utils import blobMechanism
import uuid
import os
from utils import celery
from graphdb import create_tool_node

@celery.task
def submit_celery(tool_name, data_name, args, user_email):
    db_client = pymongo.MongoClient(os.environ['SPASS_CONNECTION_STRING']).spassDatabase
    
    file_id = str(uuid.uuid4())
    db_client.statusCollection.insert_one({'owner': user_email, 'status': 'Executing', 'job_id': file_id})
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

    data_register = {}
    data_register['tool'] = tool_name
    data_register['data'] = data_name
    data_register['args'] = args
    data_register['id'] = file_id

    blobMechanism.create_blob_from_path('seismic-results', file_name, file_name)
    os.system('rm -rf *.su ' + file_name)

    insertedResult = db_client.resultsCollection.insert_one(data_register)
    create_tool_node(user_email, file_name, "Result", file_name, str(insertedResult.inserted_id))
    db_client.statusCollection.update({'job_id': file_id}, {'$set': { 'status': 'Executed'}})
    return