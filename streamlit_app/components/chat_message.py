"""Chat message bubble renderer with dark theme badges and citations."""

from __future__ import annotations

import streamlit as st


def render_message(msg: dict):
    """Render a single chat message bubble with metadata badges and citations."""
    role = msg.get("role", "assistant")
    avatar = "🤖" if role == "assistant" else "👤"

    with st.chat_message(role, avatar=avatar):
        # Assistant metadata pill (route + latency)
        if role == "assistant" and (msg.get("route") or msg.get("latency") or msg.get("latency_ms")):
            route = msg.get("route", "")
            latency = msg.get("latency") or (
                round(msg["latency_ms"] / 1000, 2) if "latency_ms" in msg else None
            )

            badge_class = "badge-purple"
            badge_icon = "🤖"
            route_text = "Assistant"

            if route == "it_support":
                badge_class = "badge-green"
                badge_icon = "🔧"
                route_text = "IT Support Engineer"
            elif route == "knowledge_base":
                badge_class = "badge-purple"
                badge_icon = "📚"
                route_text = "Knowledge Base"
            elif route == "web_search":
                badge_class = "badge-blue"
                badge_icon = "🌐"
                route_text = "Web Search"
            elif route == "small_talk":
                badge_class = "badge-purple"
                badge_icon = "💬"
                route_text = "Assistant"

            latency_str = f" • ⏱ {latency}s" if latency else ""
            badge_html = f'<span class="{badge_class}">{badge_icon} {route_text}{latency_str}</span>'
            st.markdown(badge_html, unsafe_allow_html=True)

        # Message body
        if msg.get("is_error"):
            st.error(msg.get("content", "An error occurred."))
        else:
            st.markdown(msg.get("content", ""))

        # Internal Knowledge Base Sources
        sources = msg.get("sources", [])
        if sources:
            source_pills = []
            for src in sources:
                doc_id = src.get("document_id", "?")
                page_num = src.get("page_number", "?")
                pill = (
                    f'<span style="display:inline-flex; align-items:center; background:#12121C; '
                    f'border:1px solid #29293A; border-radius:6px; padding:2px 8px; margin:2px; '
                    f'font-size:0.75rem; color:#A1A1B5;">'
                    f'📄 Doc #{doc_id} &bull; Page {page_num}</span>'
                )
                source_pills.append(pill)

            st.markdown(
                '<div style="margin-top:0.5rem; display:flex; flex-wrap:wrap; align-items:center;">'
                '<span style="font-size:0.75rem; color:#A1A1B5; margin-right:6px; text-transform:uppercase; font-weight:600;">Sources:</span>'
                + "".join(source_pills)
                + "</div>",
                unsafe_allow_html=True,
            )

        # External Web Sources
        web_results = msg.get("web_results", [])
        if web_results:
            web_links = []
            for wr in web_results[:3]:
                title = wr.get("title") or wr.get("url") or "External Link"
                url = wr.get("url", "#")
                link_html = (
                    f'<a href="{url}" target="_blank" style="display:inline-flex; align-items:center; '
                    f'background:#12121C; border:1px solid #29293A; border-radius:6px; padding:2px 8px; '
                    f'margin:2px; font-size:0.75rem; color:#60A5FA; text-decoration:none;">'
                    f'🌐 {title[:40]} ↗</a>'
                )
                web_links.append(link_html)

            st.markdown(
                '<div style="margin-top:0.4rem; display:flex; flex-wrap:wrap; align-items:center;">'
                '<span style="font-size:0.75rem; color:#A1A1B5; margin-right:6px; text-transform:uppercase; font-weight:600;">Web:</span>'
                + "".join(web_links)
                + "</div>",
                unsafe_allow_html=True,
            )
