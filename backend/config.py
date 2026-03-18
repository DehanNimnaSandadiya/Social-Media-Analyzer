import os
from dotenv import load_dotenv

load_dotenv()


def _env(name: str, default: str | None = None) -> str:
    val = os.getenv(name, default)
    if val is None or val == "":
        raise RuntimeError(f"Missing required environment variable: {name}")
    return val


class Config:
    # ── Secrets ─────────────────────────────────
    # Set these in a local `.env` file (do not commit it)
    SECRET_KEY = _env("SECRET_KEY", "dev-secret-change-me")
    JWT_SECRET_KEY = _env("JWT_SECRET_KEY", "dev-jwt-secret-change-me")

    # ── MongoDB Atlas ───────────────────────────
    # Example: mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
    MONGODB_URI = _env("MONGODB_URI")
    MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "smreport_db")

    # ── Google Gemini API ───────────────────────
    GEMINI_API_KEY = _env("GEMINI_API_KEY")

    # ── App ────────────────────────────────────
    DEBUG = os.getenv("FLASK_DEBUG", "1") == "1"
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "5000"))
