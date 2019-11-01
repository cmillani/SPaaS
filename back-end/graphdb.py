from neo4j import GraphDatabase
import os
graphDb = GraphDatabase.driver(os.environ['GRAPHDB_CONNECTION_STRING'])
# MARK: - Graph DB

OPERATION_READ = 1
OPERATION_WRITE = 10

def create_blob_node(owner, name, data_type, blob_name):
    def _create_node(tx):
        tx.run("MERGE (p:Person {email: {uemail}}) "
                "CREATE (d:" + data_type + " {name: {dataname}, blob: {blobname}}) "
                "CREATE (p)-[:OWNS]->(d)", uemail=owner, dataname=name, blobname=blob_name)

    with graphDb.session() as session:
        session.write_transaction(_create_node)

def create_tool_node(owner, name, data_type, blob_name, mongoid):
    def _create_node(tx):
        tx.run("MERGE (p:Person {email: {uemail}}) "
                "CREATE (d:" + data_type + " {name: {dataname}, blob: {blobname}, mongoid: {id}}) "
                "CREATE (p)-[:OWNS]->(d)", uemail=owner, dataname=name, blobname=blob_name, id=mongoid)

    with graphDb.session() as session:
        session.write_transaction(_create_node)

def list_user_nodes(user, data_type):
    def _list_nodes(tx):
        return tx.run("MATCH (user:Person {email: {uemail} })"
                        "MATCH (user)-[:OWNS|MEMBER|PERMISSION*]->(entity:" + data_type + ")"
                        "RETURN entity", uemail=user)
    with graphDb.session() as session:
        return session.read_transaction(_list_nodes).graph().nodes

def validate_access(user, type, node_id):
    def _validate_access(tx):
        return tx.run("MATCH (user:Person {email: {uemail}}) "
                        "MATCH (target) WHERE id(target) = {id} "
                        "MATCH p = (user)-[:OWNS|MEMBER|PERMISSION*]->(target) "
                        "WHERE all(rel in relationships(p) WHERE rel.level IS NULL OR rel.level >= {level}) "
                        "RETURN target", uemail=user, id=int(node_id), level=type)
    with graphDb.session() as session:
        nodes = session.read_transaction(_validate_access).graph().nodes
        target_node = None
        for node in nodes:
            target_node = node
            break
        return target_node

def delete_entity_and_paths(entity_id):
    def _delete_paths(tx):
        tx.run("MATCH (entity) WHERE id(entity) = {id} "
                "MATCH ()-[rel]-(entity) "
                "DELETE rel, entity", id=int(entity_id))
    with graphDb.session() as session:
        session.write_transaction(_delete_paths)

def validate_ownership(email, entity_id):
    def _validate_ownership(tx):
        return tx.run("MATCH (user:Person {email: {uemail}}) "
                        "MATCH (target) WHERE id(target) = {id} "
                        "MATCH (user)-[:OWNS]->(target) "
                        "RETURN target", uemail=email, id=int(entity_id))
    with graphDb.session() as session:
        nodes = session.read_transaction(_validate_ownership).graph().nodes
        target_node = None
        for node in nodes:
            target_node = node
            break
        return target_node

def add_permission(entity_id, user_email, permission):
    def _add_permission(tx):
        tx.run("MATCH (user:Person {email: {uemail}}) "
                "MATCH (entity) WHERE id(entity) = {id} "
                "CREATE (user)-[:PERMISSION {level: {permission}}]->(entity) ", 
                uemail=user_email, id=int(entity_id), permission=permission)
    with graphDb.session() as session:
        session.write_transaction(_add_permission)

def add_permission_group(entity_id, group_id, permission):
    def _add_permission(tx):
        tx.run("MATCH (group:Group) WHERE id(group) = {groupId} "
                "MATCH (entity) WHERE id(entity) = {id} "
                "CREATE (group)-[:PERMISSION {level: {permission}}]->(entity) ", 
                groupId=int(group_id), id=int(entity_id), permission=permission)
    with graphDb.session() as session:
        session.write_transaction(_add_permission)


# MARK: Folders

def create_folder_node(folder_name, user_email):
    def _create_folder(tx):
        tx.run("MATCH (user:Person {email: {uemail}}) "
                "CREATE (folder:Folder {name: {fname}})"
                "CREATE (user)-[:OWNS]->(folder) "
                "CREATE (user)-[:MEMBER]->(folder) ", 
                uemail=user_email, fname=folder_name)
    with graphDb.session() as session:
        session.write_transaction(_create_folder)

def get_folders(user_email):
    def _create_folder(tx):
        return tx.run("MATCH (user:Person {email: {uemail}}) "
                        "MATCH (user)-[:MEMBER*]->(folder:Folder) "
                        "RETURN folder ", uemail=user_email)
    with graphDb.session() as session:
        return session.read_transaction(_create_folder).graph().nodes

# MARK: Groups

def create_group_node(folder_name, user_email):
    def _create_folder(tx):
        tx.run("MATCH (user:Person {email: {uemail}}) "
                "CREATE (group:Group {name: {fname}})"
                "CREATE (user)-[:OWNS]->(group) "
                "CREATE (user)-[:MEMBER]->(group) ", 
                uemail=user_email, fname=folder_name)
    with graphDb.session() as session:
        session.write_transaction(_create_folder)

def get_groups(user_email):
    def _create_folder(tx):
        return tx.run("MATCH (user:Person {email: {uemail}}) "
                        "MATCH (user)-[:MEMBER*]->(group:Group) "
                        "RETURN group ", uemail=user_email)
    with graphDb.session() as session:
        return session.read_transaction(_create_folder).graph().nodes