from collections import defaultdict
import json
CONSOLIDATED_NODES=[
    {
    "google_cloudfunctions_function":{
        "label":"google_cloudfunctions_function"
    }
},
{
    "google_bigquery":{
        "label":"google_bigquery_dataset"
    }

},
{
    "google_sql_database":{
        "label": "google_sql_database"
    }
},
{
    "google_storage_bucket":{
        "label":"google_storage_bucket"
    }

},{
    "google_sql_user":{ 
        "label":"google_sql_user"
    }
},{
    "google_compute_network":{
        "label":"google_compute_network"
    }
},{
    "google_compute_global_forwarding_rule":{   
        "label":"google_compute_global_forwarding_rule"
    }
},{
    "google_cloud_run_service":{
        "label":"google_cloud_run_service"
    }
},{
    "google_logging_metric":{
        "label":"google_logging_metric"
    }
}]

CONNECTIONS_TO_ADD = [
    ("google_compute_global_forwarding_rule", "google_cloud_run_service"),
]

LABELS_TO_REMOVE =    ["google_compute_backend_service",
                      "google_compute_region_network_endpoint_group",
                      "google_service_account",
                      "google_project_iam_custom_role",
                      "google_project_iam_binding",
                      "google_sql_user",
                      "data.google_secret_manager_secret_version",
                      "data.google_secret_manager_secret_version",
                      "google_project_service",
                      "google_project_iam_member",
                      "google_iam_workload_identity_pool",
                      "google_compute_ssl_policy",
                      "google_compute_url_map"
                      "google_compute_global_forwarding_rule",
                      "google_compute_target_http_proxy",
                      "google_secret_manager_secret",
                      "node"
                      ]
BOUNDARIES = ["google_compute_network", "google_vpc_access_connector", "google_service_networking_connection","google_compute_subnetwork"]

# This function splits the labels of the nodes in the JSON data into label which is generic to all resources and name of that resource.
def destructure_json(json_string):
    data = json.loads(json_string)
    nodesarray = data.get("nodesarray", [])
    
    for obj in nodesarray:
        nodes = obj.get("nodes", [obj])
        for node in nodes:
            label = node.get("label", "")
            id=node.get("id", "")
            if "." in label:
                new_label,name = label.split(".", 1) 
                node["label"] = new_label
                node["name"] = id.split(".")[1]

    updated_json_string = json.dumps(data, indent=2)
    return updated_json_string

# This function adds connections between nodes based on the provided pairs
def add_connections(nodes_json):
    data = json.loads(nodes_json)
    nodesarray = data.get("nodesarray", [])
    edgesarray = data.get("edgesarray", [])
    label_to_ids = {}
    
    for obj in nodesarray:
        nodes = obj.get("nodes", [obj])
        for node in nodes:
            label = node.get("label")
            node_id = node.get("id")
            if label not in label_to_ids:
                label_to_ids[label] = []
            label_to_ids[label].append(node_id)

    # Add connections based on the provided pairs
    for source_label, target_label in CONNECTIONS_TO_ADD:
        source_ids = label_to_ids.get(source_label, [])
        target_ids = label_to_ids.get(target_label, [])
        for source_id in source_ids:
            for target_id in target_ids:
                edgesarray.append({"source": source_id, "target": target_id})

    updated_json_string = json.dumps(data, indent=2)
      
    return updated_json_string

# This function removes nodes with labels specified in LABELS_TO_REMOVE
def remove_nodes(json_string):
    data = json.loads(json_string)
    nodesarray = data.get("nodesarray", [])
    node_ids_to_remove = set()
    for obj in nodesarray:
        if "nodes" in obj:
            for node in obj["nodes"]:
                if node.get("label") in LABELS_TO_REMOVE:
                    node_ids_to_remove.add(node.get("id"))

    for obj in nodesarray:
        if "nodes" in obj:
            obj["nodes"] = [node for node in obj["nodes"] if node.get("id") not in node_ids_to_remove]

    nodesarray = [obj for obj in nodesarray if not ("id" in obj and obj["id"] in node_ids_to_remove)]
    data["nodesarray"] = nodesarray

    data["edgesarray"] = [
        edge for edge in data.get("edgesarray", [])
        if edge["source"] not in node_ids_to_remove and edge["target"] not in node_ids_to_remove
    ]

    return json.dumps(data, indent=2)

# This function removes duplicate edges from the JSON data
def remove_duplicate_edges(json_string):
    data = json.loads(json_string)
    edgesarray = data.get("edgesarray", [])
    
    edges_set = { (edge["source"], edge["target"]) for edge in edgesarray }
    
    deduplicated_edges = [ {"source": source, "target": target} for source, target in edges_set ]
    
    data["edgesarray"] = deduplicated_edges
    
    updated_json_string = json.dumps(data, indent=2)
    return updated_json_string

# This function removes edges with the specified source and target from the edges array
def remove_edges(source,target,edges):

    edges_to_remove = [edge for edge in edges if edge.get("source") == source and edge.get("target") == target]
    
    for edge in edges_to_remove:
        edges.remove(edge)

# This function consolidates nodes with the same label into a single node
def consolidate_nodes(json_string):
    data=json.loads(json_string)
    nodesarray=data.get("nodesarray",[])
    edgesarray=data.get("edgesarray",[])
    
    label_groups = defaultdict(list)
    id_to_label = {}
    for obj in nodesarray:
        nodes = obj.get("nodes", [obj])
        for node in nodes:
            label = node.get("label", "")
            name = node.get("name", "")
            node_id = node.get("id", "")
            label_groups[label].append(name)
            id_to_label[node_id] = label
    consolidated_nodes = []
    for label, names in label_groups.items():
        new_node = {
            "id": label,
            "label": label,
            "names": names
        }
        
        consolidated_nodes.append(new_node)
    data["nodesarray"] = consolidated_nodes

    for edge in edgesarray:
        source_id = edge.get("source")
        target_id = edge.get("target")
        if source_id in id_to_label.keys():
            edge["source"] = id_to_label[source_id]
        if target_id in id_to_label.keys():
            edge["target"] = id_to_label[target_id]
           
    for edge in edgesarray:   
        if(edge.get("source")==edge.get("target")):
            remove_edges(edge.get("source"),edge.get("target"),edgesarray)

    updated_json_string = remove_duplicate_edges(json.dumps(data, indent=2))
    return updated_json_string

def get_node_id_for_label(nodesarray, label):
    for obj in nodesarray:
        nodes = obj.get("nodes", [obj])
        for node in nodes:
            if node.get("label") == label:
                return node.get("id")
    return None

def get_label_for_id(nodesarray, node_id):
   
    for obj in nodesarray:
            if obj.get("id") == node_id:
                return obj.get("label")
    return None

def consolidate_cluster_nodes(json_string):
    consolidated_labels = {v["label"] for consolidated_node in CONSOLIDATED_NODES for v in consolidated_node.values()}
    data = json.loads(json_string)
    edgesarray=data.get("edgesarray",[])
    nodesarray=data.get("nodesarray", [])
    network_connections = dict()
    if len(nodesarray) >2:
        for obj in nodesarray:
            nodes = obj.get("nodes", [obj])
            if len(nodes) > 1:
                for node in nodes:
                    if node["label"] in consolidated_labels:

                        for nodeobj in nodes: 

                            if(nodeobj.get("label")=="google_service_networking_connection"): 
                                network_connections[nodeobj.get('id')]=nodeobj.get("label")
                                for edge in edgesarray:
                                    if(edge.get("target")==nodeobj.get("id")):
                                        edge["target"]=network_connections.get(nodeobj.get('id'))
                                    if(edge.get("source")==nodeobj.get("id")):
                                        edge["source"]=network_connections.get(nodeobj.get('id'))
                                continue
                            for edge in edgesarray:

                                if(edge.get("target")==nodeobj.get("id")):
                                
                                    edge["target"]=obj.get("subgraph")


                                if(edge.get("source")==nodeobj.get("id")):

                                        edge["source"]=obj.get("subgraph") 

                        for edge in edgesarray:   
                            if(edge.get("source")==edge.get("target")):
                                remove_edges(edge.get("source"),edge.get("target"),edgesarray)


                        # Create a new node with the specified id and label
                        new_node = {
                            "id": obj.get("subgraph"),
                            "label": node["label"],
                            "name": node["name"]
                        }
                        obj["nodes"]=[new_node]

                        break
                    else:
                        continue
            else:
                continue
                           
    updated_json_string = json.dumps(data, indent=2)
    return updated_json_string


# This functions creates a structure of network connections.
def get_network_connections(data):
    edgesarray=data.get("edgesarray",[])
    structure = {}

    for edge in edgesarray:
        source, target = edge["source"], edge["target"]
        if source in BOUNDARIES and target not in BOUNDARIES:
            if source not in structure:
                structure[source]={"type": "boundary", "children":[]}
            structure[source]["children"].append(target)
        elif target in BOUNDARIES and source not in BOUNDARIES:
            if target not in structure:
                structure[target]={"type": "boundary", "children":[]}
            structure[target]["children"].append(source)

    for edge in edgesarray:
        source, target = edge["source"], edge["target"]
        if source in BOUNDARIES and target in BOUNDARIES:
            if target not in structure:
                structure[target] = {"type": "boundary", "children": []}
            structure[target]["children"].append({source: structure[source]})
            del structure[source]
            
    updated_json_string = json.dumps(structure, indent=2)
    return updated_json_string
            

def remove_metadata_edges(json_str):
    graph = json.loads(json_str)
    special_labels={"var", "provider", "data"}
    special_node_ids = {node["id"] for node in graph["nodesarray"] if node["label"] in special_labels}

    filtered_edges = [
        edge for edge in graph["edgesarray"]
        if edge["source"] not in special_node_ids and edge["target"] not in special_node_ids
    ]

    updated_graph = {
        "nodesarray": graph["nodesarray"],
        "edgesarray": filtered_edges
    }

    return json.dumps(updated_graph, indent=2)

#This function removes edges between network nodes and connected nodes
# def remove_network_edges(network_nodes,connected_nodes,data):
    
#     edges=data.get("edgesarray",[])
#     for network_node in network_nodes:
#         for connected_node in connected_nodes:
#             remove_edges(connected_node,network_node.get("id"),edges)

#     updated_json_string = json.dumps(data, indent=2)
#     return updated_json_string
