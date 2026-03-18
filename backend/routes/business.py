from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import create_business, get_businesses_by_user, get_business_by_id

business_bp = Blueprint("business", __name__)


@business_bp.route("/", methods=["POST"])
@jwt_required()
def add_business():
    user_id = str(get_jwt_identity())
    data = request.get_json()

    required = ["business_name", "business_type", "description", "platforms"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    biz_id = create_business(user_id, data)
    return jsonify({"message": "Business saved", "business_id": biz_id}), 201


@business_bp.route("/", methods=["GET"])
@jwt_required()
def list_businesses():
    user_id = str(get_jwt_identity())
    businesses = get_businesses_by_user(user_id)
    return jsonify(businesses), 200


@business_bp.route("/<biz_id>", methods=["GET"])
@jwt_required()
def get_business(biz_id):
    user_id = str(get_jwt_identity())
    biz = get_business_by_id(biz_id, user_id)
    if not biz:
        return jsonify({"error": "Business not found"}), 404
    return jsonify(biz), 200
