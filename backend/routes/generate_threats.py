import os
import traceback
import json
import re
import zlib
from flask import Blueprint, request, jsonify
from services.augur_service import augur
from werkzeug.utils import secure_filename
from docx import Document
from docx.opc.exceptions import PackageNotFoundError
import fitz
import uuid
from datetime import datetime
from azure.storage.blob import BlobServiceClient

from dotenv import load_dotenv
load_dotenv()

# Azure Blob Setup
AZURE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
BLOB_CONTAINER = os.getenv("AZURE_BLOB_CONTAINER", "threats")
blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
container_client = blob_service_client.get_container_client(BLOB_CONTAINER)
try:
    container_client.create_container()
except Exception:
    pass  # already exists

generate_threats = Blueprint('generate_threats', __name__)

# Paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
PRODUCT_SPEC_DIR = os.path.join(UPLOAD_DIR, "productspec")
PLANTUML_DIR = os.path.join(UPLOAD_DIR, "plantuml")
DRAWIO_DIR = os.path.join(UPLOAD_DIR, "drawio")
PROMPT_FILE = os.path.join(BASE_DIR, "prompts.txt")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PRODUCT_SPEC_DIR, exist_ok=True)
os.makedirs(PLANTUML_DIR, exist_ok=True)
os.makedirs(DRAWIO_DIR, exist_ok=True)

# Utils
def extract_text_from_docx(file_path: str) -> str:
    doc = Document(file_path)
    return "\n".join(p.text for p in doc.paragraphs)

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    with fitz.open(file_path) as pdf:
        for page in pdf:
            text += page.get_text()
    return text

def read_text_file(path: str) -> str:
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        return f.read()

def encode_plantuml(text: str) -> str:
    def deflate_and_encode(data: str) -> str:
        compressed = zlib.compress(data.encode("utf-8"))[2:-4]
        return encode64(compressed)

    def encode6bit(b: int) -> str:
        if b < 10: return chr(48 + b)
        b -= 10
        if b < 26: return chr(65 + b)
        b -= 26
        if b < 26: return chr(97 + b)
        b -= 26
        if b == 0: return "-"
        if b == 1: return "_"
        return "?"

    def append3bytes(b1, b2, b3):
        c1 = b1 >> 2
        c2 = ((b1 & 0x3) << 4) | (b2 >> 4)
        c3 = ((b2 & 0xF) << 2) | (b3 >> 6)
        c4 = b3 & 0x3F
        return (
            encode6bit(c1 & 0x3F)
            + encode6bit(c2 & 0x3F)
            + encode6bit(c3 & 0x3F)
            + encode6bit(c4 & 0x3F)
        )

    def encode64(data: bytes) -> str:
        res = ""
        for i in range(0, len(data), 3):
            if i + 2 == len(data):
                res += append3bytes(data[i], data[i + 1], 0)
            elif i + 1 == len(data):
                res += append3bytes(data[i], 0, 0)
            else:
                res += append3bytes(data[i], data[i + 1], data[i + 2])
        return res

    return deflate_and_encode(text)

def save_upload(file_storage, dest_dir: str, filename: str = None):
    os.makedirs(dest_dir, exist_ok=True)
    fname = secure_filename(filename or file_storage.filename)
    dest_path = os.path.join(dest_dir, fname)
    file_storage.save(dest_path)
    return dest_path, fname

def clean_ai_json(text: str):
    cleaned = re.sub(r"^```json\s*|\s*```$", "", text.strip(), flags=re.IGNORECASE | re.MULTILINE)
    return json.loads(cleaned)

# Save to Blob
def save_threat_to_blob(threat_entry):
    blob_name = f"{threat_entry['id']}.json"
    blob_client = container_client.get_blob_client(blob_name)
    blob_client.upload_blob(json.dumps(threat_entry, indent=2), overwrite=True)

# Routes
@generate_threats.route("/generate_threats", methods=["POST"])
def generate_threats_route():
    if "prodspecdoc" not in request.files:
        return jsonify({"error": "Missing 'prodspecdoc'"}), 400

    if "plantumlfile" not in request.files and "drawiofile" not in request.files:
        return jsonify({"error": "Either 'plantumlfile' or 'drawiofile' required."}), 400

    try:
        threat_name = (request.form.get("threat_name") or "").strip()
        if not threat_name:
            return jsonify({"error": "Threat name is required."}), 400

        prod_file = request.files["prodspecdoc"]
        prod_path, prod_filename = save_upload(prod_file, PRODUCT_SPEC_DIR)

        edited_spec_text = (request.form.get("prodspec_text") or "").strip()
        if edited_spec_text:
            product_specification_doc = edited_spec_text
        else:
            lower_name = prod_filename.lower()
            if lower_name.endswith(".txt"):
                product_specification_doc = read_text_file(prod_path)
            elif lower_name.endswith(".pdf"):
                product_specification_doc = extract_text_from_pdf(prod_path)
            elif lower_name.endswith(".docx"):
                try:
                    product_specification_doc = extract_text_from_docx(prod_path)
                except PackageNotFoundError:
                    product_specification_doc = read_text_file(prod_path)
            else:
                return jsonify({"error": "Unsupported product spec type"}), 415

        diagram_filename = None
        diagram_content = None
        diagram_url = None

        if "plantumlfile" in request.files:
            puml_file = request.files["plantumlfile"]
            puml_path, diagram_filename = save_upload(puml_file, PLANTUML_DIR)
            with open(puml_path, "r", encoding="utf-8", errors="replace") as f:
                diagram_content = f.read()
            encoded_diagram = encode_plantuml(diagram_content)
            diagram_url = f"https://www.plantuml.com/plantuml/png/{encoded_diagram}"

        elif "drawiofile" in request.files:
            drawio_file = request.files["drawiofile"]
            drawio_path, diagram_filename = save_upload(drawio_file, DRAWIO_DIR)
            with open(drawio_path, "r", encoding="utf-8", errors="replace") as f:
                diagram_content = f.read()
            diagram_url = f"/uploads/drawio/{diagram_filename}"

        context, aithreats = augur(product_specification_doc, diagram_content, PROMPT_FILE)

        try:
            threats_json = clean_ai_json(aithreats)
            threats_list = threats_json.get("threat_scenarios", [])
        except Exception as e:
            traceback.print_exc()
            return jsonify({"error": "Failed to parse AI threats JSON: " + str(e)}), 500

        threat_id = str(uuid.uuid4())
        threat_entry = {
            "id": threat_id,
            "threat_name": threat_name,
            "timestamp": datetime.now().isoformat(),
            "plantuml_filename": diagram_filename,
            "spec_filename": prod_filename,
            "context": context,
            "aithreats": threats_list,
            "diagram_url": diagram_url,
        }

        save_threat_to_blob(threat_entry)
        return jsonify(threat_entry), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Internal Server Error: {e}"}), 500

# List threats
@generate_threats.route('/get_threats', methods=["GET"])
def get_all_threats():
    try:
        threats = []
        for blob in container_client.list_blobs():
            blob_client = container_client.get_blob_client(blob.name)
            data = blob_client.download_blob().readall()
            threats.append(json.loads(data))
        threats.sort(key=lambda x: x["timestamp"], reverse=True)
        return jsonify(threats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get threat by ID
@generate_threats.route('/get_threats/<id>', methods=["GET"])
def get_threat_by_id(id):
    try:
        blob_name = f"{id}.json"
        blob_client = container_client.get_blob_client(blob_name)
        if not blob_client.exists():
            return jsonify({"error": "Threat not found"}), 404
        data = blob_client.download_blob().readall()
        return jsonify(json.loads(data))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Delete threat
@generate_threats.route('/delete_threat/<id>', methods=["DELETE"])
def delete_threat(id):
    try:
        blob_name = f"{id}.json"
        blob_client = container_client.get_blob_client(blob_name)
        if not blob_client.exists():
            return jsonify({"error": "Threat not found"}), 404
        blob_client.delete_blob()
        return jsonify({"message": f"Threat with ID {id} deleted successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
