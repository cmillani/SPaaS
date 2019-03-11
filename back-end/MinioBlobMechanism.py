from minio import Minio
from minio.error import ResponseError

class BlobFile:
    def __init__(self, name):
        self.name = name

class MinioBlobMechanism:

    minioClient = None

    def __init__(self):
        self.minioClient = Minio('127.0.0.1:9000', 
                            access_key='V1EWU3R30LAXGS91GO5A', 
                            secret_key='+EialmsTicKnmjwUGBKlplf3PJMzr25FWhLhDcRM', 
                            secure=False)

        if not self.minioClient.bucket_exists('seismic-data'):
            self.minioClient.make_bucket('seismic-data')
        if not self.minioClient.bucket_exists('seismic-tools'):
            self.minioClient.make_bucket('seismic-tools')
        if not self.minioClient.bucket_exists('seismic-results'):
            self.minioClient.make_bucket('seismic-results')

    def get_blob_to_path(self, container_name, blob_name, file_path):
        self.minioClient.fget_object(container_name, blob_name, file_path)

    def create_blob_from_path(self, container_name, blob_name, file_path):
        self.minioClient.fput_object(container_name, blob_name, file_path)

    def list_blobs(self, container_name):
        blobObjects = self.minioClient.list_objects(container_name)
        objects = [BlobFile(blobObject.object_name) for blobObject in blobObjects]
        return objects

    def delete_blob(self, container_name, blob_name):
        self.minioClient.remove_object(container_name, blob_name)