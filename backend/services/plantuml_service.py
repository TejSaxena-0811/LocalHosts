from plantuml import PlantUML
import parser_tf

def generate_plantuml_content(dot_content):
    plantuml_content = parser_tf.generate_puml(dot_content, "output.puml")
    plantuml = PlantUML(url='http://www.plantuml.com/plantuml/img/')
    diagram_url = plantuml.get_url(plantuml_content)
    return plantuml_content, diagram_url

    