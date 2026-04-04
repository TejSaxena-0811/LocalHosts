import re
from html import unescape

def clean_description(text):
   
    if "<" in text and ">" in text: 
        text = re.sub(r'<[^>]*>', ' ', text)  
        text = unescape(text) 
        text = re.sub(r'\s+', ' ', text).strip() 
    return text

def extract_components_and_connections(json_data):
    components = []
    connections = []
    id_to_name = {} 
    edge_descriptions = {} 

    try:
        root = json_data["mxfile"]["diagram"]["mxGraphModel"]["root"]

        
        if "object" in root:
            objects = root["object"]
            if isinstance(objects, dict): 
                objects = [objects]

            for obj in objects:
                component = {
                    "id": obj["@id"],
                    "name": obj.get("@c4Name", "Unknown"),
                    "type": obj.get("@c4Type", "Unknown"),
                    "description": obj.get("@c4Description", "No description")
                }
                components.append(component)
                id_to_name[obj["@id"]] = obj.get("@c4Name", "Unknown") 
        
       
        if "mxCell" in root:
            mx_cells = root["mxCell"]
            if isinstance(mx_cells, dict):  
                mx_cells = [mx_cells]

            for cell in mx_cells:
                if cell.get("@vertex") == "1" and "@parent" in cell and "@value" in cell:
                    cleaned_value = clean_description(cell["@value"])  
                    edge_descriptions[cell["@parent"]] = cleaned_value  

            
            for cell in mx_cells:
                if cell.get("@edge") == "1":  
                    connection_id = cell["@id"]
                    connection = {
                        "source": id_to_name.get(cell.get("@source", "Unknown"), cell.get("@source", "Unknown")),
                        "destination": id_to_name.get(cell.get("@target", "Unknown"), cell.get("@target", "Unknown")),
                        "description": edge_descriptions.get(connection_id, "No description") 
                    }
                    connections.append(connection)

    except KeyError:
        print("Error: Could not find expected keys in JSON structure.")
    
    return {"components": components, "connections": connections}
