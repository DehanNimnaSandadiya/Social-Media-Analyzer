from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import (
    get_business_by_id, save_report,
    get_reports_by_user, get_report_by_id
)
from services.ai_service import generate_report

report_bp = Blueprint("report", __name__)


@report_bp.route("/generate", methods=["POST"])
@jwt_required()
def generate():
    user_id = str(get_jwt_identity())
    data = request.get_json()
    biz_id = data.get("business_id")

    if not biz_id:
        return jsonify({"error": "business_id required"}), 400

    biz = get_business_by_id(biz_id, user_id)
    if not biz:
        return jsonify({"error": "Business not found"}), 404

    ai_data = generate_report(biz)
    title = f"Social Media Report — {biz['business_name']}"
    report_id = save_report(
        biz_id,
        user_id,
        title,
        ai_data,
        business_name=biz.get("business_name"),
        business_type=biz.get("business_type"),
    )

    return jsonify({"report_id": report_id, "report": ai_data}), 200


@report_bp.route("/", methods=["GET"])
@jwt_required()
def list_reports():
    user_id = str(get_jwt_identity())
    reports = get_reports_by_user(user_id)
    return jsonify(reports), 200


@report_bp.route("/<report_id>", methods=["GET"])
@jwt_required()
def get_report(report_id):
    user_id = str(get_jwt_identity())
    rpt = get_report_by_id(report_id, user_id)
    if not rpt:
        return jsonify({"error": "Report not found"}), 404
    return jsonify(rpt), 200
