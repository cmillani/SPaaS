from utils import blobMechanism
import os

def upload_to_azure(data_name, container_name, data_content):
    data_content.save(data_name)
    blobMechanism.create_blob_from_path(container_name, data_name, data_name)
    os.system('rm -rf '+ data_name)

def delete_blob(blob_name, container_name):
    blobMechanism.delete_blob(container_name, blob_name)

def list_files(container_name):
    data = blobMechanism.list_blobs(container_name)
    all_names = [d.name for d in data]
    return all_names