# import os
# import sys
# from flask import Flask, send_from_directory
# from flask_cors import CORS

# # Add parent directory to sys.path
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# # Set up base directories
# basedir = os.path.abspath(os.path.dirname(__file__))
# frontend_build_dir = os.path.join(basedir, '..', 'frontend', 'build')

# # Initialize Flask app
# app = Flask(__name__, static_folder=frontend_build_dir, static_url_path='/')
# CORS(app)

# # === Import Routes ===
# from routes.upload_plantuml import upload_plantuml
# from routes.upload_productspec import upload_productspec
# from routes.generate_threats import generate_threats
# from routes.drawio_upload import drawio_bp

# # === Register Blueprints ===
# app.register_blueprint(upload_plantuml)
# app.register_blueprint(upload_productspec)
# app.register_blueprint(generate_threats)
# app.register_blueprint(drawio_bp)

# # === Serve React Frontend ===
# @app.route('/')
# def serve():
#     return send_from_directory(app.static_folder, 'index.html')

# # === Ensure Upload Directories Exist ===
# if __name__ == '__main__':
#     os.makedirs(os.path.join(basedir, 'uploads', 'plantuml'), exist_ok=True)
#     os.makedirs(os.path.join(basedir, 'uploads', 'productspec'), exist_ok=True)
#     os.makedirs(os.path.join(basedir, 'uploads', 'drawio'), exist_ok=True)  # ✅ For draw.io
#     app.run(host='0.0.0.0', port=5000, debug=True)
























import os
import sys
from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from azure.storage.blob import BlobServiceClient

# === Load Environment Variables ===
load_dotenv()

# Add parent directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Set up base directories
basedir = os.path.abspath(os.path.dirname(__file__))
frontend_build_dir = os.path.join(basedir, '..', 'frontend', 'build')

# Initialize Flask app
app = Flask(__name__, static_folder=frontend_build_dir, static_url_path='/')
CORS(app)

# === Azure Blob Storage Client ===
AZURE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
BLOB_CONTAINER = os.getenv("AZURE_BLOB_CONTAINER")  # e.g. "raptoruploads"

if not AZURE_CONNECTION_STRING or not BLOB_CONTAINER:
    raise ValueError("⚠️ Missing Azure Blob credentials in .env")

blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
container_client = blob_service_client.get_container_client(BLOB_CONTAINER)

# Create container if it doesn’t exist
try:
    container_client.create_container()
except Exception:
    pass

# Pass container client to routes
app.config["AZURE_CONTAINER"] = container_client

# === Import Routes ===
from routes.upload_plantuml import upload_plantuml
from routes.upload_productspec import upload_productspec
from routes.generate_threats import generate_threats
from routes.drawio_upload import drawio_bp

# === Register Blueprints ===
app.register_blueprint(upload_plantuml)
app.register_blueprint(upload_productspec)
app.register_blueprint(generate_threats)
app.register_blueprint(drawio_bp)

# === Serve React Frontend ===
@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

# === Run Server ===
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
