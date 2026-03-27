import os
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from docx import Document

upload_productspec = Blueprint('upload_productspec', __name__)
basedir = os.path.abspath(os.path.dirname(__file__))

# Extracts plain text from the uploaded .docx file
def extract_text_from_docx(file_path):
    try:
        doc = Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])
    except Exception as e:
        raise RuntimeError(f"Failed to read .docx file: {str(e)}")

@upload_productspec.route('/upload-productspec', methods=['POST'])
def upload_spec_file():
    if 'file' not in request.files:
        return jsonify({'message': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400

    try:
        # ✅ Save in a dedicated folder
        upload_folder = os.path.join(basedir, '..', 'uploads', 'productspec')
        os.makedirs(upload_folder, exist_ok=True)

        filename = secure_filename(file.filename)
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)

        # ✅ Extract text content from docx
        text_content = extract_text_from_docx(file_path)

        return jsonify({
            'message': f'ProductSpec file "{filename}" uploaded successfully!',
            'filename': filename,
            'filepath': file_path,
            'content': text_content
        }), 200

    except Exception as e:
        return jsonify({
            'message': 'File upload failed',
            'error': str(e)
        }), 500
