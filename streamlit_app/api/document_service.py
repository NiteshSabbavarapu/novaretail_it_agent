"""Document service — upload and retrieve PDFs from deployed backend."""

from __future__ import annotations

from streamlit_app.api import get, post_multipart


def list_documents() -> list[dict]:
    """GET /api/documents/ — return all indexed documents."""
    try:
        resp = get("documents/")
        if resp.status_code == 200:
            return resp.json()
    except Exception:
        pass
    return []


def upload_document(file_bytes: bytes, filename: str, title: str = "", department_id: int = 1) -> dict:
    """POST /api/documents/upload/ — upload a PDF for backend chunking & indexing."""
    if not title:
        title = filename.replace(".pdf", "").replace("_", " ")

    resp = post_multipart(
        "documents/upload/",
        data={"title": title, "department": str(department_id)},
        files={"file": (filename, file_bytes, "application/pdf")},
    )
    resp.raise_for_status()
    return resp.json()
