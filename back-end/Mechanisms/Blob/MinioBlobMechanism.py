from minio import Minio
from minio.error import ResponseError
from .BlobConfiguration import *
import os

class BlobFile:
    def __init__(self, name):
        self.name = name

class MinioBlobMechanism:

    def __init__(self):
        self.minioClient = Minio(os.environ['MINIO_ENDPOINT'], 
                            access_key=os.environ['MINIO_ACCESS_KEY'], 
                            secret_key=os.environ['MINIO_SECRET_KEY'], 
                            secure=False)

        if not self.minioClient.bucket_exists(DataBlob):
            self.minioClient.make_bucket(DataBlob)
        if not self.minioClient.bucket_exists(ToolsBlob):
            self.minioClient.make_bucket(ToolsBlob)
        if not self.minioClient.bucket_exists(ResultsBlob):
            self.minioClient.make_bucket(ResultsBlob)

    def download_blob(self, container_name, blob_name):
        return self.minioClient.get_object(container_name, blob_name)

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