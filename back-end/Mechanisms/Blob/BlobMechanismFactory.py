from AzureBlobMechanism import AzureBlobMechanism
from MinioBlobMechanism import MinioBlobMechanism
import os

class BlobMechanismFactory:

    @staticmethod
    def getMechanism():
        if os.environ['BLOB_MECHANISM'] == "minio":
            return MinioBlobMechanism()
        elif os.environ['BLOB_MECHANISM'] == "azure":
            return AzureBlobMechanism()