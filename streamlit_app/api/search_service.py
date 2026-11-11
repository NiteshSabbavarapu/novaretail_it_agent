"""Search service — call the hybrid search API on deployed backend."""

from __future__ import annotations

import time

from streamlit_app.api import post


def execute_search(query: str, conversation_id: int | None = None) -> dict:
    """POST /api/search/ — run search through backend RAG and LangGraph pipeline.

    Returns a dict with keys: answer, sources, route, web_results,
    conversation_id, latency.
    """
    payload: dict = {"query": query}
    if conversation_id:
        payload["conversation_id"] = conversation_id

    start = time.time()
    resp = post("search/", json=payload)
    latency = round(time.time() - start, 2)

    resp.raise_for_status()
    data = resp.json()
    data["latency"] = latency
    return data
