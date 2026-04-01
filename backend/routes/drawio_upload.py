import os
from flask import Blueprint, request, jsonify, send_from_directory

drawio_bp = Blueprint("drawio", __name__)
UPLOAD_FOLDER = "uploads/drawio"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@drawio_bp.route("/drawio_upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    return jsonify({"filename": file.filename})

@drawio_bp.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@drawio_bp.route("/save_drawio", methods=["POST"])
def save_drawio():
    try:
        data = request.json
        xml_content = data.get("xml")
        original_filename = data.get("filename", "diagram.drawio")

        if not xml_content:
            return jsonify({"error": "No XML content provided"}), 400

        # New file name with the word "edited"
        edited_filename = f"edited_{original_filename}"
        filepath = os.path.join(UPLOAD_FOLDER, edited_filename)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(xml_content)

        return jsonify({
            "message": "Diagram saved",
            "filename": edited_filename,
            "path": filepath
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
