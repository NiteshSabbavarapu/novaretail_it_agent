"""
NovaRetail Streamlit App — Central Configuration.

Reads the deployed backend API base URL from root .env.
Ensures every request connects to the production backend.
"""

from __future__ import annotations

import os
from pathlib import Path
from dotenv import load_dotenv

# Load root .env
ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")

# Deployed Railway backend URL
_DEFAULT_URL = "https://novaretailitagent-production.up.railway.app/api"
_raw_url = os.getenv("API_BASE_URL", _DEFAULT_URL).strip().rstrip("/")

# Normalize so it always ends with /api without duplication
if not _raw_url.endswith("/api"):
    _raw_url = f"{_raw_url}/api"

API_BASE_URL: str = _raw_url
