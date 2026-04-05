import csv
import json
import re
from jinja2 import Template

c4_template = """
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

title {{ title }}

{% for location in locations %}
System_Boundary({{ location }},"{{ location }}") {
  {% for app in apps %}
  System_Boundary({{ location }}-{{ app }},"{{ app }}") {     
    {% for container in containers %}
        {% if container['app'] == app %} 
        {% if container['location'] == location %} 
        Container({{ container['id'] }}, "{{ container['name'] }}", "{{ container['technology'] }}")
        {% endif %}
        {% endif %}
    {% endfor %}        
    {% for container_db in container_dbs %}
        {% if container_db['app'] == app %}  
        {% if container_db['location'] == location %}
        ContainerDb({{ container_db['id'] }}, "{{ container_db['name'] }}", "{{ container_db['technology'] }}")
        {% endif %}
        {% endif %}
    {% endfor %}    
  }
  {% endfor %}
}
{% endfor %}

@enduml
"""

def convert_to_json(data_str):
    # Step 1: Initial clean-up to remove spaces around colons and commas
    data_str = re.sub(r'\s*:\s*', ':', data_str)
    
    # Step 2: Use regular expressions to split the string into key-value pairs
    key_value_pairs = re.findall(r'\{key:(.*?),value:(.*?)(?=\}|$)\}', data_str)

    # Step 3: Process each key-value pair
    json_list = []
    for key, value in key_value_pairs:
        # Quote the key
        key = f'{key}'
        
        # Quote the value if it's a string or needs quoting
        if value in ['true', 'false', 'null']:
            # Boolean or null literals do not need additional quotes
            value = value
        elif re.match(r'^\d+(\.\d+)?$', value):  # Numeric value
            value = value
        else:
            # Everything else should be treated as a string
            value = f'{value}'
        
        # Create the dictionary and append to the list
        json_list.append({key: value})

    # Convert the list of dictionaries to JSON format
    json_str = json.dumps(json_list, indent=2)
    return json_str

def parse_key_value_pairs(data_str):
  """Parses a string containing key-value pairs in JSON format.
  Args:
      data (str): The string containing the key-value pairs.
  Returns:
      dict: A dictionary containing the parsed key-value pairs.
  """
  
  data_str_fixed = convert_to_json(data_str)
  # Step 1: Wrap keys in double quotes, including those with special characters (dots, slashes, hyphens, and underscores)
  #data_str_fixed = re.sub(r'(\b[\w.-/]+\b)\s*:', r'"\1":', data_str)
  #data_str_fixed = re.sub(r'(\b[\w.-/]+\b)\s*:', r'"\1":', data_str)

  # Step 2: Wrap non-numeric and non-quoted values (like strings and hexadecimals with hyphens) in double quotes
  #data_str_fixed = re.sub(r'(?<=:)([a-zA-Z0-9/._-]+)(?=[,\}])', r'"\1"', data_str_fixed)
  # Step 2: Wrap values containing colons, dashes, and other special characters in double quotes
  # This handles dates, UUIDs, and other similar values
  #data_str_fixed = re.sub(r'(?<=:)([^\{\}\[\],":]+(?=[,\}])|[^,\{\}\[\]":]+(?=[,\}]))', r'"\1"', data_str_fixed)

  # Step 3: Handle empty values by replacing them with empty strings
  #data_str_fixed = re.sub(r'(?<=:)(?=[,\}])', '""', data_str_fixed)
  #data_str_fixed = re.sub(r'(?<=:)(?=[,\}])', '""', data_str_fixed)

  try:
    parsed_data = json.loads(data_str_fixed)
    return parsed_data
  except json.JSONDecodeError:
    # Handle invalid JSON strings (optional)
    return {}  # Or raise an exception
  

# Function to parse instance
def parseCompute(app, location, k8cluster, row, containers):
  id = f"{'c'+str(len(containers))}"
  name = row['Display name']
  resource_type = row['Resource type'].split('.')
  technology = f"{resource_type[0]}.{resource_type[1]}"
  
  if row['Resource type'] in ['compute.Instance', 'appengine.Application']:
    if row['State'] in ['RUNNING', 'SERVING']:      
        if k8cluster != 'not-specified':
            existing_container = next((container for container in containers if container['name'] == k8cluster), None)
            if existing_container:
                existing_container['name'] = k8cluster
                existing_container['technology'] = f"{resource_type[0]+'.k8cluster'}"
                return None
            else:
                name = k8cluster

        return {
            'id': id,
            'name': name,
            'technology': technology,
            'location': location,
            'app': app
        }
  elif row['Resource type'] in ['run.Service', 'cloudfunctions.Function']:
    if app != 'not-specified':
        return {
            'id': id,
            'name': name,
            'technology': technology,
            'location': location,
            'app': app
        }

  return None

# Function to parse storage
def parseStorage(app, location, row, id):
  if row['Resource type'] in ['sqladmin.Instance']:
        return({
            'id': f"{'d'+str(id)}",
            'name': row['Display name'],
            'technology': f"{row['Resource type'].split('.')[0]}.{row['Resource type'].split('.')[1]}",
            'location': location,
            'app': app
        })
  return

def get_value_from_json(json_list, keys, default_value):
    """
    Extracts the value for the specified key from a list of dictionaries.
    
    Args:
        json_list: A list of dictionaries representing JSON data.
        key: The key for which the value needs to be extracted.
        
    Returns:
        The value associated with the key if it exists; otherwise, None.
    """
    for item in json_list:
        for key in keys:
            if key in item:
               return item[key]
    return default_value

# Function to generate C4 PlantUML from CSV
def generatePuml(csv_file, output_file):
  locations = set()  # Use a set to store unique locations
  apps = set()  # Use a set to store unique apps
  containers = []
  container_dbs = []
  

  with open(csv_file, newline='') as f:
    reader = csv.DictReader(f, delimiter=';')
    for row in reader:
      #get location
      location = row['Location'].split('-')[0]     
      
      #get app
      app='not-specified'
      k8cluster='not-specified'
      key_value_pairs = parse_key_value_pairs(row['Labels'])      
      if(len(key_value_pairs) > 0):
        app=get_value_from_json(key_value_pairs, ['app', 'application'], 'not-specified')
        k8cluster=get_value_from_json(key_value_pairs, ['goog-k8s-cluster-name'], 'not-specified')

      #get container
      container = parseCompute(app, location, k8cluster, row, containers)
      if(container):
        containers.append(container)        
        locations.add(location)  # Add unique locations to the set
        apps.add(app)  # Add unique locations to the set      

      #get container_db
      container_db = parseStorage(app, location, row, len(container_dbs))
      if(container_db):
        container_dbs.append(container_db)
        locations.add(location)  # Add unique locations to the set
        apps.add(app)  # Add unique locations to the set

  # Handle multiple k8 containers
  
  
  # Convert the set of locations to a list (optional for Jinja2 template)
  locations = list(locations)
  apps = list(apps)

  # Use Jinja2 to render the PlantUML file
  template = Template(c4_template)
  plantuml_content = template.render(title="C4 Model", locations=locations, containers=containers, container_dbs=container_dbs, apps=apps)

  # Remove empty lines from the PlantUML content
  plantuml_content = '\n'.join(line for line in plantuml_content.splitlines() if line.strip())

  # Write to output PlantUML file
  with open(output_file, 'w') as f:
    f.write(plantuml_content)

