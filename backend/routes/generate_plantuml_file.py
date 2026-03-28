from flask import Blueprint, request, jsonify
from services.plantuml_service import generate_plantuml_content

generate_plantuml_file = Blueprint('generate_plantuml_file', __name__)

@generate_plantuml_file.route("/generate_plantuml_file", methods=["POST"])
def generate_plantuml_file_route():
    if 'merged_file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['merged_file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        dot_content = file.read().decode('utf-8')
        plantuml_content, diagram_url = generate_plantuml_content(dot_content)
        return jsonify({
            "plantuml_file": plantuml_content,
            "diagram_url": diagram_url
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500