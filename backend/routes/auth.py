from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
import bcrypt
from models.database import create_user, get_user_by_email

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    full_name = data.get("full_name", "").strip()
    email     = data.get("email", "").strip().lower()
    password  = data.get("password", "")

    if not full_name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if get_user_by_email(email):
        return jsonify({"error": "Email already registered"}), 409

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user_id = create_user(full_name, email, hashed)
    token = create_access_token(identity=str(user_id))
    return jsonify({"message": "Account created", "token": token, "user": {"id": user_id, "full_name": full_name, "email": email}}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = get_user_by_email(email)
    if not user or not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_access_token(identity=str(user["id"]))
    return jsonify({
        "token": token,
        "user": {"id": user["id"], "full_name": user["full_name"], "email": user["email"]}
    }), 200
