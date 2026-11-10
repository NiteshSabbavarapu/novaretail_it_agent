
import os
import json
import urllib.request
import urllib.error

from typing import Annotated

from dotenv import load_dotenv
from tavily import TavilyClient

from langchain_core.tools import tool
from langgraph.prebuilt import InjectedState

from core.vector_utils import hybrid_search


load_dotenv()


@tool
def search_knowledge_base(
    query: str,
    department_id: Annotated[int, InjectedState("department_id")]
) -> str:
    """
    Search internal company documentation for IT troubleshooting,
    policies, procedures, and organization-specific information.

    Use this tool when the employee asks about internal company
    information or needs help troubleshooting an IT issue.
    The department ID is provided by authenticated application state.
    """

    if not department_id:
        return json.dumps({
            "success": False,
            "error": "Department information is unavailable."
        })

    results = hybrid_search(
        query=query,
        department_id=department_id,
        top_k=5
    )

    relevant_chunks = [
        chunk for chunk in results
        if chunk.get("rerank_score", -99) > -5.0
    ]

    if not relevant_chunks:
        return json.dumps({
            "success": True,
            "found": False,
            "message": "No relevant information found in the internal knowledge base."
        })

    chunks = []

    for chunk in relevant_chunks:
        chunks.append({
            "document_id": chunk["document_id"],
            "page_number": chunk["page_number"],
            "content": chunk["content"],
            "rerank_score": chunk.get("rerank_score")
        })

    return json.dumps({
        "success": True,
        "found": True,
        "chunks": chunks
    }, ensure_ascii=False)


@tool
def search_web(query: str) -> str:
    """
    Search the public internet for external technical information,
    current software documentation, and recent technology updates.

    Use this tool when information is not specific to internal
    company documentation or requires current external research.
    """

    api_key = os.getenv("TAVILY_API_KEY")

    if not api_key:
        return json.dumps({
            "success": False,
            "error": "Web search is not configured."
        })

    tavily = TavilyClient(api_key=api_key)

    try:
        response = tavily.search(
            query=query,
            search_depth="advanced",
            max_results=5
        )

        results = []

        for result in response.get("results", []):
            results.append({
                "title": result.get("title"),
                "content": (result.get("content") or "")[:3000],
                "url": result.get("url")
            })

        return json.dumps({
            "success": True,
            "results": results
        }, ensure_ascii=False)

    except Exception:
        return json.dumps({
            "success": False,
            "error": "External web search failed."
        })


@tool
def check_service_status(service_name: str) -> str:
    """
    Check the operational status of a configured company application.

    Use this tool when an employee reports that a company application
    or service is unavailable, unreachable, or behaving unexpectedly.

    Only the application configured in the service health settings
    can be checked. Do not invent service health information.
    """

    configured_name = os.getenv("SERVICE_NAME", "NovaRetail")
    health_url = os.getenv("SERVICE_HEALTH_URL", "http://127.0.0.1:8000/api/health/")

    if not configured_name or not health_url:
        return json.dumps({
            "success": False,
            "error": "Service health monitoring is not configured."
        })

    name_clean = service_name.strip().lower()
    config_clean = configured_name.strip().lower()

    if name_clean != config_clean and "novaretail" not in name_clean:
        return json.dumps({
            "success": False,
            "error": f"Service '{service_name}' is not configured for health monitoring. Monitored service is '{configured_name}'."
        })

    try:
        request = urllib.request.Request(
            health_url,
            headers={"Accept": "application/json"},
            method="GET"
        )

        with urllib.request.urlopen(request, timeout=5) as response:

            status_code = response.status

            body = response.read(4096).decode(
                "utf-8",
                errors="replace"
            )

            try:
                health_data = json.loads(body)

                summary = {
                    key: health_data[key]
                    for key in ("status", "message")
                    if key in health_data
                }

            except (json.JSONDecodeError, TypeError):
                summary = {}

            return json.dumps({
                "success": True,
                "service": configured_name,
                "status": (
                    "operational"
                    if 200 <= status_code < 300
                    else "degraded"
                ),
                "http_status": status_code,
                "details": summary
            })

    except urllib.error.HTTPError as exc:

        return json.dumps({
            "success": True,
            "service": configured_name,
            "status": "degraded",
            "http_status": exc.code
        })

    except Exception:

        return json.dumps({
            "success": True,
            "service": configured_name,
            "status": "unreachable",
            "message": "The health endpoint could not be reached."
        })


tools = [
    search_knowledge_base,
    search_web,
    check_service_status
]
