import os
import sys

# Make sure imports resolve when running from backend/
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from routes.auth import auth_bp
from routes.business import business_bp
from routes.report import report_bp

# ── App factory ────────────────────────────────────────────────────────────
app = Flask(
    __name__,
    static_folder=os.path.join(os.path.dirname(__file__), "..", "frontend"),
    static_url_path=""
)

app.config["SECRET_KEY"]     = Config.SECRET_KEY
app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY

CORS(app, resources={r"/api/*": {"origins": "*"}})
JWTManager(app)

# ── API Blueprints ─────────────────────────────────────────────────────────
app.register_blueprint(auth_bp,     url_prefix="/api/auth")
app.register_blueprint(business_bp, url_prefix="/api/businesses")
app.register_blueprint(report_bp,   url_prefix="/api/reports")

# ── Serve Frontend ─────────────────────────────────────────────────────────
@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>")
def static_files(path):
    full = os.path.join(app.static_folder, path)
    if os.path.exists(full):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

# ── Health check ───────────────────────────────────────────────────────────
@app.route("/api/health")
def health():
    return {"status": "ok", "message": "SM Report Generator API running"}, 200


if __name__ == "__main__":
    print("=" * 60)
    print("  AI Social Media Report Generator")
    print("  BSc Software Engineering — Kingston University")
    print("  Student: Kushani Maleesha Wickramarathna | K2557717")
    print(f"  Running at: http://localhost:{Config.PORT}")
    print("=" * 60)
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)
