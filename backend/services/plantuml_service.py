from plantuml import PlantUML
import parser_tf
# Converts DOT graph content into PlantUML format using parser_tf
# and generates a diagram URL from the PlantUML server.
def generate_plantuml_content(dot_content):
    plantuml_content = parser_tf.generate_puml(dot_content, "output.puml")
    plantuml = PlantUML(url='http://www.plantuml.com/plantuml/img/')
    diagram_url = plantuml.get_url(plantuml_content)
    return plantuml_content, diagram_url

    