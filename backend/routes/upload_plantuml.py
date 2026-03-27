import os
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename

upload_plantuml = Blueprint('upload_plantuml', __name__)
basedir = os.path.abspath(os.path.dirname(__file__))

@upload_plantuml.route('/upload-plantuml', methods=['POST'])
def upload_plantuml_file():
    if 'file' not in request.files:
        return jsonify({'message': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400

    upload_folder = os.path.join(basedir, '..', 'uploads', 'plantuml')
    os.makedirs(upload_folder, exist_ok=True)

    # ✅ Save with original filename instead of hardcoded input.puml
    filename = secure_filename(file.filename)
    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)

    return jsonify({
        'message': f'PlantUML file {filename} uploaded successfully!',
        'filename': filename
    }), 200
