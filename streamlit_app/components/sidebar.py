"""Sidebar component — minimal branding and new chat control."""

from __future__ import annotations

import streamlit as st


def render_sidebar():
    """Render minimal dark sidebar with branding, new chat action, and backend status."""
    with st.sidebar:
        # Branding Header
        st.markdown(
            """
            <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.25rem;">
                <div style="width:34px; height:34px; border-radius:10px; background:linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); display:flex; align-items:center; justify-content:center; box-shadow:0 0 16px rgba(139, 92, 246, 0.4);">
                    <span style="font-size:1.1rem;">🛒</span>
                </div>
                <div>
                    <div style="font-weight:700; font-size:1.05rem; color:#F5F3FF; letter-spacing:-0.02em;">NovaRetail</div>
                    <div style="font-size:0.75rem; color:#A1A1B5;">Enterprise Assistant</div>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

        st.divider()

        # New Chat Action
        if st.button("✨ New Chat", use_container_width=True, type="primary", key="sb_new_chat"):
            st.session_state["chat_messages"] = []
            st.session_state["chat_conversation_id"] = None
            st.session_state["active_tab"] = "Upload Documents & Chat"
            st.rerun()

        st.divider()

        # Operational Status
        st.markdown(
            """
            <div style="font-size:0.75rem; color:#A1A1B5; margin-bottom:0.4rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">
                Backend Connected
            </div>
            <div style="display:flex; align-items:center; gap:0.4rem; font-size:0.75rem; color:#F5F3FF; background:#181824; border:1px solid #29293A; border-radius:8px; padding:0.5rem 0.65rem;">
                <span style="width:7px; height:7px; border-radius:50%; background:#22C55E; box-shadow:0 0 8px #22C55E;"></span>
                <span style="font-family:monospace; color:#A78BFA; font-size:0.7rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Railway Production</span>
            </div>
            """,
            unsafe_allow_html=True,
        )
