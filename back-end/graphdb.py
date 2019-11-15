from neo4j import GraphDatabase
import os

graphDb = None
try:
    graphDb = GraphDatabase.driver(os.environ['GRAPHDB_CONNECTION_STRING'])
except:
    print("Failed to init graphdb driver")
# MARK: - Graph DB

OPERATION_READ = 1
OPERATION_WRITE = 10

def get_driver():
    global graphDb
    if graphDb is not None:
        return graphDb
    else:
        graphDb = GraphDatabase.driver(os.environ['GRAPHDB_CONNECTION_STRING'])
        return graphDb

def create_blob_node(owner, name, data_type, blob_name):
    def _create_node(tx):
        tx.run("MERGE (p:Person {email: {uemail}}) "
                "CREATE (d:" + data_type + " {name: {dataname}, blob: {blobname}}) "
                "CREATE (p)-[:OWNS]->(d)", uemail=owner, dataname=name, blobname=blob_name)

    with get_driver().session() as session:
        session.write_transaction(_create_node)

def create_tool_node(owner, name, data_type, blob_name, mongoid):
    def _create_node(tx):
        tx.run("MERGE (p:Person {email: {uemail}}) "
                "CREATE (d:" + data_type + " {name: {dataname}, blob: {blobname}, mongoid: {id}}) "
                "CREATE (p)-[:OWNS]->(d)", uemail=owner, dataname=name, blobname=blob_name, id=mongoid)

    with get_driver().session() as session:
        session.write_transaction(_create_node)

def list_user_nodes(user, data_type):
    def _list_nodes(tx):
        return tx.run("MATCH (user:Person {email: {uemail} })"
                        "MATCH (user)-[:OWNS|MEMBER|PERMISSION*]->(entity:" + data_type + ")"
                        "RETURN entity", uemail=user)
    with get_driver().session() as session:
        return session.read_transaction(_list_nodes).graph().nodes

def validate_access(user, accessType, node_id):
    def _validate_access(tx):
        return tx.run("MATCH (user:Person {email: {uemail}}) "
                        "MATCH (target) WHERE id(target) = {id} "
                        "MATCH p = (user)-[:OWNS|MEMBER|PERMISSION*]->(target) "
                        "WHERE all(rel in relationships(p) WHERE rel.level IS NULL OR rel.level >= {level}) "
                        "RETURN target", uemail=user, id=int(node_id), level=int(accessType))
    with get_driver().session() as session:
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
    with get_driver().session() as session:
        session.write_transaction(_delete_paths)

def validate_ownership(email, entity_id):
    def _validate_ownership(tx):
        return tx.run("MATCH (user:Person {email: {uemail}}) "
                        "MATCH (target) WHERE id(target) = {id} "
                        "MATCH (user)-[:OWNS]->(target) "
                        "RETURN target", uemail=email, id=int(entity_id))
    with get_driver().session() as session:
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
                uemail=user_email, id=int(entity_id), permission=int(permission))
    with get_driver().session() as session:
        session.write_transaction(_add_permission)

def add_permission_group(entity_id, group_id, permission):
    def _add_permission(tx):
        tx.run("MATCH (group:Group) WHERE id(group) = {groupId} "
                "MATCH (entity) WHERE id(entity) = {id} "
                "CREATE (group)-[:PERMISSION {level: {permission}}]->(entity) ", 
                groupId=int(group_id), id=int(entity_id), permission=int(permission))
    with get_driver().session() as session:
        session.write_transaction(_add_permission)

def validate_membership(email, groupId):
    def _validate_membership(tx):
        return tx.run("MATCH (user:Person {email: {uemail}}) "
                        "MATCH (target) WHERE id(target) = {id} "
                        "MATCH p = (user)-[:MEMBER]->(target) "
                        "RETURN p", uemail=email, id=int(groupId))
    with get_driver().session() as session:
        nodes = session.read_transaction(_validate_membership).graph().nodes
        target_node = None
        for node in nodes:
            target_node = node
            break
        return target_node

def add_member(email, groupId):
    def _add_member(tx):
        tx.run("MATCH (user:Person {email: {uemail}}) "
                "MATCH (group:Group) WHERE id(group) = {groupId} "
                "CREATE (user)-[:MEMBER]->(group) ", 
                uemail=email, groupId=int(groupId))
    with get_driver().session() as session:
        session.write_transaction(_add_member)

# MARK: Folders

def create_folder_node(folder_name, user_email):
    def _create_folder(tx):
        tx.run("MATCH (user:Person {email: {uemail}}) "
                "CREATE (folder:Folder {name: {fname}})"
                "CREATE (user)-[:OWNS]->(folder) ", 
                uemail=user_email, fname=folder_name)
    with get_driver().session() as session:
        session.write_transaction(_create_folder)

def get_folders(user_email):
    def _create_folder(tx):
        return tx.run("MATCH (user:Person {email: {uemail}}) "
                        "MATCH (user)-[:OWNS|PERMISSION*]->(folder:Folder) "
                        "RETURN folder ", uemail=user_email)
    with get_driver().session() as session:
        return session.read_transaction(_create_folder).graph().nodes

def get_entity_path(entityId):
    def _get_entity_path(tx):
        return tx.run("MATCH (owner:Person)-[:OWNS]->(entity) where id(entity) = {id} "
                        "OPTIONAL MATCH (parent:Folder)-[:PERMISSION]->(entity) "
                        "OPTIONAL MATCH p = (owner)-[:OWNS|PERMISSION*]->(parent) "
                        "RETURN nodes(p), owner "
                        "ORDER BY length(p) DESC "
                        "LIMIT 1 ", id=int(entityId))
    with get_driver().session() as session:
        result = session.read_transaction(_get_entity_path)
        origin = ""
        folders = []
        for a in result:
            origin = a["owner"]["email"]
            if a["nodes(p)"] is not None:
                for node in a["nodes(p)"]:
                    if "Folder" in node.labels:
                        folders.append(node['name'])
        return origin + ":/" + "/".join(folders)
            
def move_to_folder(entity_id, folder_id, permission):
    def _move_to_folder(tx):
        return tx.run("MATCH (entity) WHERE id(entity) = {id_entity} "
                        "MATCH (folder:Folder) WHERE id(folder) = {id_folder} "
                        "OPTIONAL MATCH (:Folder)-[parentrel:PERMISSION]->(entity) "
                        "DELETE parentrel "
                        "CREATE (folder)-[:PERMISSION {level: {permission}}]->(entity)", 
                        id_entity=int(entity_id), id_folder=int(folder_id), permission=int(permission))
    with get_driver().session() as session:
        return session.read_transaction(_move_to_folder)

# MARK: Groups

def create_group_node(folder_name, user_email):
    def _create_folder(tx):
        tx.run("MATCH (user:Person {email: {uemail}}) "
                "CREATE (group:Group {name: {fname}})"
                "CREATE (user)-[:OWNS]->(group) "
                "CREATE (user)-[:MEMBER]->(group) ", 
                uemail=user_email, fname=folder_name)
    with get_driver().session() as session:
        session.write_transaction(_create_folder)

def get_groups(user_email):
    def _create_folder(tx):
        return tx.run("MATCH (user:Person {email: {uemail}}) "
                        "MATCH (user)-[:MEMBER*]->(group:Group) "
                        "RETURN group ", uemail=user_email)
    with get_driver().session() as session:
        return session.read_transaction(_create_folder).graph().nodes