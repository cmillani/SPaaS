from azure.storage.blob import BlockBlobService, PublicAccess
from .BlobConfiguration import *
import os

class AzureBlobMechanism:

    def __init__(self):
        self.seismic_blob = BlockBlobService(account_name=os.environ['SPASS_AZURE_ACCOUNT_NAME'], account_key=os.environ['SPASS_DATA_BLOB_KEY'])
        self.seismic_blob.create_container(DataBlob)
        self.seismic_blob.set_container_acl(DataBlob, public_access=PublicAccess.Container)
        self.seismic_blob.create_container(ToolsBlob)
        self.seismic_blob.set_container_acl(ToolsBlob, public_access=PublicAccess.Container)
        self.seismic_blob.create_container(ResultsBlob)
        self.seismic_blob.set_container_acl(ResultsBlob, public_access=PublicAccess.Container)

    def download_blob(self, container_name, blob_name):
        raise NotImplementedError()

    def get_blob_to_path(self, container_name, blob_name, file_path):
        return self.seismic_blob.get_blob_to_path(container_name, blob_name, file_path)

    def create_blob_from_path(self, container_name, blob_name, file_path):
        return self.seismic_blob.create_blob_from_path(container_name, blob_name, file_path)

    def list_blobs(self, container_name):
        return self.seismic_blob.list_blobs(container_name)

    def delete_blob(self, container_name, blob_name):
        return self.seismic_blob.delete_blob(container_name, blob_name)