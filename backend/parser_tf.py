import pydot
import re
import json
from collections import defaultdict
from graphmaker import BOUNDARIES, add_connections,remove_metadata_edges, consolidate_cluster_nodes, consolidate_nodes,  destructure_json, get_network_connections, remove_nodes

def parse_dot(dot_content):
    graphs = pydot.graph_from_dot_data(dot_content)
    return graphs[0] if graphs else None


def generate_json(dot_graph):
    nodesarray = []
    edgesarray = []
    edge_pattern = re.compile(r'"([^"]+)"\s*->\s*"([^"]+)"')
    node_pattern = re.compile(r'"([^"]+)" \[label="([^"]+)"\];')
   
    subgraphs = dot_graph.get_subgraphs() 
    
    for subgraph in subgraphs:
        subgraph_name = subgraph.get_name()
        
        subgraph_dict = {"subgraph": subgraph_name, "nodes": []}
        
        # Add nodes inside the subgraph
        nodes = subgraph.get_nodes()
        
        for node in nodes:
            node_id = node.get_name().strip('"')
            
            node_label = node.get_attributes().get("label", node_id).strip('"')
            subgraph_dict["nodes"].append({"id": node_id, "label": node_label})
            

        nodesarray.append(subgraph_dict)
        
    
    if(len(dot_graph.get_nodes())==1):
        for node in dot_graph.get_nodes():
            node_id = node.get_name().strip('"')
            node_label = node.get_attributes().get("label", node_id).strip('"')
            if not any(node_id in subgraph['nodes'] for subgraph in nodesarray):  
                nodesarray.append({"id": node_id, "label": node_label})


        edges = edge_pattern.findall(str(dot_graph))
        for source, target in edges:
            edgesarray.append({"source": source.strip('"'), "target": target.strip('"')})

            # Add the edge
            edgesarray.append({"source": source, "target": target})
    else:
        nodesarray.extend(
        {"id": node.get_name().strip('"'), "label": node.get_attributes().get("label", node.get_name()).strip('"')}
        for node in dot_graph.get_nodes()
        )
    
    
        edgesarray.extend(
        {"source": edge.get_source().strip('"'), "target": edge.get_destination().strip('"')}
        for edge in dot_graph.get_edges()
        )
    
    graph_dict = {"nodesarray": nodesarray, "edgesarray": edgesarray}
    return json.dumps(graph_dict, indent=2)


def save_plantuml(plantuml_content, filename):
    with open(filename, "w") as file:
        file.write(plantuml_content)
    print(f"PlantUML file generated and saved to {filename}")

def save_json(json_content, filename):
    with open(filename, "w") as file:
        file.write(json_content)

def parse_node(node, plantuml_lines):
    
    if isinstance(node, dict):
        for key, value in node.items():
            if value.get("type") == "boundary":
                plantuml_lines.append(f'Container_Boundary({key.replace("-", "_")}, "{key}") {{\n')
                for child in value["children"]:
                    parse_node(child, plantuml_lines)
                plantuml_lines.append('}\n')
            else:
                node_id = key.replace("-", "_")
                node_label = key.replace("-", "_")
                plantuml_lines.append(f'Container({node_id}, "{node_label}","","{key}")\n')
                
    else:
        node_id = node.replace("-", "_")
        node_label = node.replace("-", "_")
        plantuml_lines.append(f'Container({node_id}, "{node_label}","","{node}")\n')
        

def generate_plantuml(nodes_json):
    plantuml_lines = []
    graph_json = json.loads(nodes_json)
    network_connections=json.loads(get_network_connections(graph_json))

    nodes = graph_json.get("nodesarray",[])
    edges = graph_json.get("edgesarray",[])
    
    nodes_with_edges = [edge.get("source") for edge in edges] + [edge.get("target") for edge in edges]
    nodes_without_edges=[]

    # Create Boundaries for network nodes and place connected nodes inside them
    for key, value in network_connections.items():
        parse_node({key: value}, plantuml_lines)
        

    # Create containers for nodes
    for obj in nodes:
        sub_nodes = obj.get("nodes", [obj])
        for node in sub_nodes:   
            if node.get("label") not in BOUNDARIES:  
                node_id = node.get("id").replace("-", "_")
                node_label = node.get("label").replace("-", "_")
                if node.get("id") in nodes_with_edges:
                    plantuml_lines.append(f'Container({node_id}, "{node_label}","","{node.get("names")}")\n')
                else:
                    nodes_without_edges.append(node)

    # Create a boundary for nodes without edges
    
    plantuml_lines.append(f'Container_Boundary(resources, "resources/metadata"){{\n')
    for node in nodes_without_edges:
        node_id = node.get("id").replace("-", "_")
        node_label = node.get("label").replace("-", "_")
        plantuml_lines.append(f'Container({node_id}, "{node_label}","","{node.get("names")}")\n')
    plantuml_lines.append("}\n")

    
    # Create connections between nodes
    for edge in edges:
        if edge.get("source") not in BOUNDARIES and edge.get("target") not in BOUNDARIES:
            source_id = edge.get("source").replace("-", "_")
            target_id = edge.get("target").replace("-", "_")
            plantuml_lines.append(f'Rel("{source_id}", "{target_id}", "connects to")')
    
    return "\n".join(plantuml_lines)

def generate_puml(dot_content, output_file):
    all_plantuml_content = []
    plantuml_header = "@startuml"+"\n"+"!include <C4/C4_Container>"+"\n"+"title System Container Diagram"+"\n"+"left to right direction"+"\n"
    dot_graph = parse_dot(dot_content)

    graphjson = generate_json(dot_graph)

    # steps to modify json
    graph_json = destructure_json(graphjson)

    graph_with_connections = add_connections(graph_json)
    
    graph_with_consolidated_clusters = consolidate_cluster_nodes(graph_with_connections)

    graph_with_removed_nodes = remove_nodes(graph_with_consolidated_clusters)
    
    consolidated_graph = consolidate_nodes(graph_with_removed_nodes)
    
    final_consolidated_graph=remove_metadata_edges(consolidated_graph)
    
    plantuml_content = generate_plantuml(final_consolidated_graph)
    all_plantuml_content.append(plantuml_content)

    combined_plantuml_content = "\n".join(all_plantuml_content)
    #save_plantuml(plantuml_header+combined_plantuml_content+"\n"+'@enduml', output_file+'.puml')
    return plantuml_header+combined_plantuml_content+"\n"+'@enduml'
