"""Conversation service — list and retrieve conversations from deployed backend."""

from __future__ import annotations

from streamlit_app.api import get


def list_conversations() -> list[dict]:
    """GET /api/conversations/ — return all conversations."""
    resp = get("conversations/")
    resp.raise_for_status()
    return resp.json()


def get_conversation(conversation_id: int) -> dict:
    """GET /api/conversations/<id>/ — return a single conversation with messages."""
    resp = get(f"conversations/{conversation_id}/")
    resp.raise_for_status()
    return resp.json()
