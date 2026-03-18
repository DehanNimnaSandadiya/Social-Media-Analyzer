HEAD
# AI-Based Social Media Report Generator for Sri Lankan Businesses
## Final Year Project - BSc Software Engineering, Kingston University London
### Student: Kushani Maleesha Wickramarathna | K2557717

---

## Project Structure

```
socialmedia-report-generator/
├── backend/
│   ├── app.py                  # Main Flask application
│   ├── config.py               # Configuration (DB, API keys)
│   ├── requirements.txt        # Python dependencies
│   ├── models/
│   │   ├── __init__.py
│   │   └── database.py         # MongoDB (Atlas) data access
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py             # Login/Register routes
│   │   ├── business.py         # Business input routes
│   │   └── report.py           # Report generation routes
│   └── services/
│       ├── __init__.py
│       ├── ai_service.py       # Gemini AI integration
│       └── report_service.py   # Report logic
├── frontend/
│   ├── index.html              # Landing page
│   ├── login.html              # Login page
│   ├── register.html           # Register page
│   ├── dashboard.html          # User dashboard
│   ├── input.html              # Business info input form
│   ├── report.html             # Report display page
│   ├── css/
│   │   ├── main.css            # Global styles
│   │   ├── auth.css            # Login/Register styles
│   │   ├── dashboard.css       # Dashboard styles
│   │   ├── input.css           # Form styles
│   │   └── report.css          # Report styles
│   └── js/
│       ├── api.js              # API calls helper
│       ├── auth.js             # Auth logic
│       ├── dashboard.js        # Dashboard logic
│       ├── input.js            # Form submission
│       ├── report.js           # Report rendering & charts
│       └── pdf.js              # PDF generation
└── database/
    └── schema.sql              # (legacy) MySQL schema (no longer required)
```

---

## Setup Instructions

### 1. Install Prerequisites
- Python 3.10+
- MongoDB Atlas (connection string)
- Node.js (optional, for live reload)

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure Environment
Copy `backend/.env.example` to `backend/.env` and fill in:
- `MONGODB_URI` (MongoDB Atlas connection string)
- `GEMINI_API_KEY` (Google Gemini API key)
- `SECRET_KEY` + `JWT_SECRET_KEY`

### 4. Run
```bash
cd backend
python app.py
```

Open browser: `http://localhost:5000`

---

## API Key
- Google Gemini API: Get free at https://aistudio.google.com/app/apikey
=======
# Social-Media-Analyzer
AI-powered web app that generates personalized social media strategy reports for Sri Lankan businesses using Flask, MongoDB, and Google Gemini.
>>>>>>> f148f6545c01bddbe3c289b641ba1d7980871037
