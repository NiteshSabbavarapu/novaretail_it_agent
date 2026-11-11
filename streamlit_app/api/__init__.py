"""
NovaRetail Central API Client.

All requests pass through this module to ensure:
- Centralized base URL from config.py
- Zero duplicate /api segments
- Consistent timeout and error handling
- Support for GET, POST, PUT, PATCH, DELETE, and multipart uploads
"""

from __future__ import annotations

import requests

from streamlit_app.config import API_BASE_URL

_TIMEOUT = 45


def _url(path: str) -> str:
    """
    Construct a clean endpoint URL without duplicate /api segments.
    Examples:
      _url("conversations/") -> https://.../api/conversations/
      _url("/conversations/") -> https://.../api/conversations/
      _url("api/conversations/") -> https://.../api/conversations/
    """
    cleaned = path.strip().lstrip("/")
    if cleaned.startswith("api/"):
        cleaned = cleaned[4:].lstrip("/")

    base = API_BASE_URL.rstrip("/")
    if not base.endswith("/api"):
        base = f"{base}/api"

    return f"{base}/{cleaned}"


def get(path: str, params: dict | None = None) -> requests.Response:
    """Execute GET request against configured backend."""
    return requests.get(_url(path), params=params, timeout=_TIMEOUT)


def post(path: str, json: dict | None = None) -> requests.Response:
    """Execute POST request against configured backend."""
    return requests.post(_url(path), json=json, timeout=_TIMEOUT)


def put(path: str, json: dict | None = None) -> requests.Response:
    """Execute PUT request against configured backend."""
    return requests.put(_url(path), json=json, timeout=_TIMEOUT)


def patch(path: str, json: dict | None = None) -> requests.Response:
    """Execute PATCH request against configured backend."""
    return requests.patch(_url(path), json=json, timeout=_TIMEOUT)


def delete(path: str) -> requests.Response:
    """Execute DELETE request against configured backend."""
    return requests.delete(_url(path), timeout=_TIMEOUT)


def post_multipart(path: str, data: dict, files: dict) -> requests.Response:
    """Execute multipart/form-data POST request for document uploads."""
    return requests.post(_url(path), data=data, files=files, timeout=_TIMEOUT)
