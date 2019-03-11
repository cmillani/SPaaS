from azure.storage.blob import BlockBlobService, PublicAccess
import os

class AzureBlobMechanism:

    seismic_blob = None

    def __init__(self):
        self.seismic_blob = BlockBlobService(account_name='seismicdata', account_key=os.environ['SPASS_DATA_BLOB_KEY'])
        self.seismic_blob.create_container('seismic-data')
        self.seismic_blob.set_container_acl('seismic-data', public_access=PublicAccess.Container)
        self.seismic_blob.create_container('seismic-tools')
        self.seismic_blob.set_container_acl('seismic-tools', public_access=PublicAccess.Container)
        self.seismic_blob.create_container('seismic-results')
        self.seismic_blob.set_container_acl('seismic-results', public_access=PublicAccess.Container)

    def get_blob_to_path(self, container_name, blob_name, file_path):
        return self.seismic_blob.get_blob_to_path(container_name, blob_name, file_path)

    def create_blob_from_path(self, container_name, blob_name, file_path):
        return self.seismic_blob.create_blob_from_path(container_name, blob_name, file_path)

    def list_blobs(self, container_name):
        return self.seismic_blob.list_blobs(container_name)

    def delete_blob(self, container_name, blob_name):
        return self.seismic_blob.delete_blob(container_name, blob_name)