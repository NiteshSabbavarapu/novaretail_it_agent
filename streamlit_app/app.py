
"""
NovaRetail — Enterprise AI Assistant.

Two-Section Interface:
  Tab 1: Conversation History
  Tab 2: Upload Documents & Chat

All requests connect through central API services to the deployed Railway backend.
"""

from __future__ import annotations

import sys
from pathlib import Path

import streamlit as st

# Add project root to Python import path
PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


# ── 1. Page Configuration ────────────────────────────────────────────

st.set_page_config(
    page_title="NovaRetail",
    page_icon="🛒",
    layout="wide",
    initial_sidebar_state="expanded",
)


# ── 2. Apply Dark Purple Theme ────────────────────────────────────────

from streamlit_app.utils.theme import apply_dark_theme

apply_dark_theme()


# ── 3. Imports ────────────────────────────────────────────────────────

from streamlit_app.api.conversation_service import (
    list_conversations,
    get_conversation,
)
from streamlit_app.api.document_service import upload_document
from streamlit_app.api.search_service import execute_search
from streamlit_app.components.chat_message import render_message
from streamlit_app.components.sidebar import render_sidebar
from streamlit_app.utils import truncate


# ── 4. Session State Initialization ──────────────────────────────────

if "chat_messages" not in st.session_state:
    st.session_state["chat_messages"] = []

if "chat_conversation_id" not in st.session_state:
    st.session_state["chat_conversation_id"] = None

if "last_uploaded_doc" not in st.session_state:
    st.session_state["last_uploaded_doc"] = None


# Render minimal sidebar
render_sidebar()


# ── 5. Minimal Header ────────────────────────────────────────────────

st.markdown(
    """
    <div style="margin-bottom: 1.25rem;">
        <h2 style="font-size: 1.85rem; font-weight: 700; margin: 0; color: #F5F3FF; letter-spacing: -0.02em;">
            NovaRetail Knowledge Assistant
        </h2>
        <p style="color: #A1A1B5; font-size: 0.9rem; margin-top: 0.2rem; margin-bottom: 0;">
            Upload enterprise documents and converse with the LangGraph-powered retrieval system.
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)


# ── 6. Two Main Tabs ─────────────────────────────────────────────────

tab_history, tab_chat = st.tabs(
    ["📜 Conversation History", "💬 Upload Documents & Chat"]
)


# ╔═══════════════════════════════════════════════════════════════════╗
# ║  TAB 1: CONVERSATION HISTORY                                     ║
# ╚═══════════════════════════════════════════════════════════════════╝

with tab_history:

    try:
        conversations = list_conversations()
    except Exception as exc:
        st.warning(f"Unable to load conversations from backend: {exc}")
        conversations = []

    if not conversations:
        st.info(
            "No previous conversations found. Start a new chat in the "
            "'Upload Documents & Chat' tab."
        )

    else:
        col_list, col_messages = st.columns([1, 2])

        with col_list:
            st.markdown(
                f"""
                <div style='font-size:0.85rem; color:#A1A1B5;
                font-weight:600; text-transform:uppercase;
                letter-spacing:0.05em; margin-bottom:0.6rem;'>
                    All Sessions ({len(conversations)})
                </div>
                """,
                unsafe_allow_html=True,
            )

            conv_options = {
                conv["id"]: (
                    f"#{conv['id']} - "
                    f"{truncate(conv.get('title') or 'Untitled', 36)} "
                    f"({conv.get('message_count', 0)} msgs)"
                )
                for conv in conversations
            }

            default_id = conversations[0]["id"]

            if (
                "selected_history_id" not in st.session_state
                or st.session_state["selected_history_id"] not in conv_options
            ):
                st.session_state["selected_history_id"] = default_id

            selected_id = st.selectbox(
                "Select a conversation",
                options=list(conv_options.keys()),
                format_func=lambda x: conv_options.get(x, str(x)),
                index=list(conv_options.keys()).index(
                    st.session_state["selected_history_id"]
                ),
                label_visibility="collapsed",
            )

            st.session_state["selected_history_id"] = selected_id

            if st.button(
                "💬 Continue in Chat Tab",
                use_container_width=True,
                type="primary",
            ):
                try:
                    loaded_data = get_conversation(selected_id)

                    st.session_state["chat_conversation_id"] = selected_id

                    st.session_state["chat_messages"] = [
                        {
                            "role": m.get("role", "user"),
                            "content": m.get("content", ""),
                        }
                        for m in loaded_data.get("messages", [])
                    ]

                    st.success(
                        f"Conversation #{selected_id} loaded into Chat tab."
                    )

                except Exception as exc:
                    st.error(f"Failed to load conversation: {exc}")

        with col_messages:

            if selected_id:

                try:
                    conv_detail = get_conversation(selected_id)

                except Exception as exc:
                    st.error(
                        f"Failed to fetch conversation #{selected_id}: {exc}"
                    )
                    conv_detail = None

                if conv_detail:

                    title = (
                        conv_detail.get("title")
                        or f"Conversation #{selected_id}"
                    )

                    created_at = (
                        conv_detail.get("created_at") or ""
                    )[:19].replace("T", " ")

                    st.markdown(
                        f"""
                        <div style="background:#181824;
                        border:1px solid #29293A;
                        border-radius:10px;
                        padding:0.9rem 1.1rem;
                        margin-bottom:1rem;">

                            <div style="font-weight:700;
                            font-size:1.05rem; color:#F5F3FF;">
                                {title}
                            </div>

                            <div style="font-size:0.75rem;
                            color:#A1A1B5; margin-top:0.2rem;">
                                ID: <code>#{selected_id}</code>
                                &bull; Created: {created_at} UTC
                            </div>

                        </div>
                        """,
                        unsafe_allow_html=True,
                    )

                    messages = conv_detail.get("messages", [])

                    if not messages:
                        st.caption(
                            "No messages recorded in this conversation."
                        )

                    else:
                        for msg in messages:
                            render_message(msg)


# ╔═══════════════════════════════════════════════════════════════════╗
# ║  TAB 2: UPLOAD DOCUMENTS & CHAT                                  ║
# ╚═══════════════════════════════════════════════════════════════════╝

with tab_chat:

    # ── Upload Section ───────────────────────────────────────────────

    with st.expander(
        "📄 Upload Document",
        expanded=(st.session_state["last_uploaded_doc"] is None),
    ):

        st.markdown(
            """
            <p style='color:#A1A1B5; font-size:0.85rem;
            margin-bottom:0.75rem;'>
                Upload a PDF document. The backend extracts text,
                chunks it, generates embeddings, and indexes it in Pinecone.
            </p>
            """,
            unsafe_allow_html=True,
        )

        uploaded_file = st.file_uploader(
            "Select a PDF file",
            type=["pdf"],
            help="Upload PDF for RAG extraction and Pinecone vector store indexing",
        )

        col_up_btn, col_up_status = st.columns([1, 3])

        with col_up_btn:
            upload_clicked = st.button(
                "Upload Document",
                type="primary",
                use_container_width=True,
                disabled=(uploaded_file is None),
            )

        if upload_clicked and uploaded_file is not None:

            with st.spinner(
                f"Ingesting '{uploaded_file.name}' via backend..."
            ):

                try:
                    res = upload_document(
                        file_bytes=uploaded_file.getvalue(),
                        filename=uploaded_file.name,
                    )

                    st.session_state["last_uploaded_doc"] = uploaded_file.name

                    st.success(
                        f"✅ Document '{uploaded_file.name}' "
                        "uploaded and indexed successfully!"
                    )

                except Exception as exc:
                    st.error(f"❌ Upload failed: {exc}")


    # ── Active Document Status Indicator ─────────────────────────────

    if st.session_state.get("last_uploaded_doc"):

        st.markdown(
            f"""
            <div style="background:#181824;
            border:1px solid #29293A;
            border-radius:8px;
            padding:0.5rem 0.85rem;
            margin-bottom:1rem;
            display:flex;
            align-items:center;
            justify-content:space-between;">

                <span style="font-size:0.85rem; color:#A1A1B5;">
                    Indexed Document:
                    <strong style="color:#A78BFA;">
                        {st.session_state['last_uploaded_doc']}
                    </strong>
                </span>

                <span class="badge-green">Ready to Chat</span>

            </div>
            """,
            unsafe_allow_html=True,
        )

    st.divider()


    # ── Chat Interface ───────────────────────────────────────────────

    if st.session_state.get("chat_conversation_id"):

        col_info, col_reset = st.columns([4, 1])

        with col_info:
            st.caption(
                f"Active Conversation: "
                f"#{st.session_state['chat_conversation_id']}"
            )

        with col_reset:

            if st.button(
                "New Chat",
                key="reset_chat_btn",
                use_container_width=True,
            ):
                st.session_state["chat_messages"] = []
                st.session_state["chat_conversation_id"] = None
                st.rerun()


    # ── Message Feed ─────────────────────────────────────────────────

    for msg in st.session_state["chat_messages"]:
        render_message(msg)


    # ── Empty State Guidance ─────────────────────────────────────────

    if not st.session_state["chat_messages"]:

        st.markdown(
            """
            <div style="background:#181824;
            border:1px dashed #29293A;
            border-radius:12px;
            padding:2rem;
            text-align:center;
            margin:1rem 0;">

                <div style="font-size:1.8rem; margin-bottom:0.35rem;">
                    💬
                </div>

                <div style="font-weight:600;
                color:#F5F3FF; font-size:0.95rem;">
                    Ask a question below
                </div>

                <div style="color:#A1A1B5;
                font-size:0.8rem; margin-top:0.25rem;">
                    Inquiries are processed by the backend LangGraph agent
                    with hybrid retrieval against your documents and knowledge base.
                </div>

            </div>
            """,
            unsafe_allow_html=True,
        )


    # ── Chat Input ───────────────────────────────────────────────────

    if user_query := st.chat_input(
        "Ask a question about your documents or IT support..."
    ):

        st.session_state["chat_messages"].append(
            {
                "role": "user",
                "content": user_query,
            }
        )

        render_message(
            {
                "role": "user",
                "content": user_query,
            }
        )


        # Submit to deployed backend search endpoint

        with st.spinner("Searching knowledge base and reasoning..."):

            try:
                conv_id = st.session_state.get("chat_conversation_id")

                response_data = execute_search(user_query, conv_id)

                st.session_state["chat_conversation_id"] = (
                    response_data.get("conversation_id")
                )

                assistant_turn = {
                    "role": "assistant",
                    "content": response_data.get(
                        "answer",
                        "No response generated.",
                    ),
                    "route": response_data.get("route"),
                    "sources": response_data.get("sources", []),
                    "web_results": response_data.get("web_results", []),
                    "latency": response_data.get("latency"),
                }

                st.session_state["chat_messages"].append(assistant_turn)

                render_message(assistant_turn)

            except Exception as exc:

                err_turn = {
                    "role": "assistant",
                    "is_error": True,
                    "content": f"Query failed: {exc}",
                }

                st.session_state["chat_messages"].append(err_turn)

                render_message(err_turn)

        st.rerun()
