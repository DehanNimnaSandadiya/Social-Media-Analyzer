from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, Optional

from bson import ObjectId
from pymongo import MongoClient

from config import Config

_client: MongoClient | None = None


def _get_client() -> MongoClient:
    global _client
    if _client is None:
        _client = MongoClient(Config.MONGODB_URI)
    return _client


def _db():
    return _get_client()[Config.MONGODB_DB_NAME]


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _oid(value: Any) -> ObjectId:
    if isinstance(value, ObjectId):
        return value
    if isinstance(value, str):
        return ObjectId(value)
    raise TypeError("Invalid id type")


def _doc_to_json(doc: Dict[str, Any]) -> Dict[str, Any]:
    out: Dict[str, Any] = {}
    for k, v in doc.items():
        if k == "_id":
            out["id"] = str(v)
        elif isinstance(v, ObjectId):
            out[k] = str(v)
        elif isinstance(v, datetime):
            out[k] = v.isoformat()
        else:
            out[k] = v
    return out


# ─── Users ───────────────────────────────────────────────────────────────────

def create_user(full_name: str, email: str, password_hash: str) -> str:
    users = _db().users
    doc = {
        "full_name": full_name,
        "email": email,
        "password_hash": password_hash,
        "created_at": _now(),
    }
    res = users.insert_one(doc)
    return str(res.inserted_id)


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    users = _db().users
    doc = users.find_one({"email": email})
    return _doc_to_json(doc) if doc else None


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    users = _db().users
    doc = users.find_one({"_id": _oid(user_id)}, {"password_hash": 0})
    return _doc_to_json(doc) if doc else None


# ─── Businesses ──────────────────────────────────────────────────────────────

def create_business(user_id: str, data: Dict[str, Any]) -> str:
    businesses = _db().businesses
    doc = {
        "user_id": _oid(user_id),
        "business_name": data["business_name"],
        "business_type": data["business_type"],
        "description": data["description"],
        "location": data.get("location", "Sri Lanka"),
        "target_province": data.get("target_province", ""),
        "platforms": list(data.get("platforms", [])),
        "current_followers": int(data.get("current_followers", 0) or 0),
        "monthly_posts": int(data.get("monthly_posts", 0) or 0),
        "created_at": _now(),
    }
    res = businesses.insert_one(doc)
    return str(res.inserted_id)


def get_businesses_by_user(user_id: str):
    businesses = _db().businesses
    docs = list(businesses.find({"user_id": _oid(user_id)}).sort("created_at", -1))
    return [_doc_to_json(d) for d in docs]


def get_business_by_id(biz_id: str, user_id: str):
    businesses = _db().businesses
    doc = businesses.find_one({"_id": _oid(biz_id), "user_id": _oid(user_id)})
    return _doc_to_json(doc) if doc else None


# ─── Reports ─────────────────────────────────────────────────────────────────

def save_report(
    business_id: str,
    user_id: str,
    title: str,
    ai_response: Dict[str, Any],
    *,
    business_name: str | None = None,
    business_type: str | None = None,
) -> str:
    reports = _db().reports
    doc = {
        "business_id": _oid(business_id),
        "user_id": _oid(user_id),
        "report_title": title,
        "ai_response": ai_response,
        "business_name": business_name,
        "business_type": business_type,
        "created_at": _now(),
    }
    res = reports.insert_one(doc)
    return str(res.inserted_id)


def get_reports_by_user(user_id: str):
    reports = _db().reports
    docs = list(reports.find({"user_id": _oid(user_id)}).sort("created_at", -1))
    return [
        {
            "id": str(d["_id"]),
            "report_title": d.get("report_title"),
            "created_at": d.get("created_at").isoformat() if d.get("created_at") else None,
            "business_name": d.get("business_name"),
            "business_type": d.get("business_type"),
        }
        for d in docs
    ]


def get_report_by_id(report_id: str, user_id: str):
    reports = _db().reports
    doc = reports.find_one({"_id": _oid(report_id), "user_id": _oid(user_id)})
    return _doc_to_json(doc) if doc else None
