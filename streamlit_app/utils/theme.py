"""NovaRetail design system — Dark theme with purple accents.

Palette:
  Main background:      #0B0B12
  Secondary background: #12121C
  Sidebar background:   #10101A
  Card background:      #181824
  Primary accent:       #8B5CF6
  Secondary accent:     #A78BFA
  Borders:              #29293A
  Main text:            #F5F3FF
  Secondary text:       #A1A1B5
  Success:              #22C55E
  Error:                #EF4444
"""

import streamlit as st

DARK_PURPLE_CSS = """
<style>
/* ── Global Background & Typography ────────────────────────────────── */
html, body, [data-testid="stAppViewContainer"], .stApp {
    background-color: #0B0B12 !important;
    color: #F5F3FF !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
}

[data-testid="stHeader"] {
    background-color: rgba(11, 11, 18, 0.8) !important;
    backdrop-filter: blur(12px) !important;
    border-bottom: 1px solid #29293A !important;
}

.block-container {
    padding-top: 2rem !important;
    padding-bottom: 3rem !important;
    max-width: 1100px !important;
}

/* ── Sidebar ───────────────────────────────────────────────────────── */
[data-testid="stSidebar"] {
    background-color: #10101A !important;
    border-right: 1px solid #29293A !important;
}

[data-testid="stSidebar"] * {
    color: #F5F3FF !important;
}

[data-testid="stSidebar"] hr {
    border-color: #29293A !important;
    margin: 1rem 0 !important;
}

[data-testid="stSidebar"] [data-testid="stPageLink-NavLink"] {
    background-color: transparent !important;
    color: #A1A1B5 !important;
    border: 1px solid transparent !important;
    border-radius: 8px !important;
    padding: 0.5rem 0.75rem !important;
    font-weight: 500 !important;
    transition: all 0.2s ease !important;
}

[data-testid="stSidebar"] [data-testid="stPageLink-NavLink"]:hover {
    background-color: #181824 !important;
    color: #F5F3FF !important;
    border-color: #29293A !important;
}

[data-testid="stSidebar"] [data-testid="stPageLink-NavLink"][aria-current="page"] {
    background-color: rgba(139, 92, 246, 0.15) !important;
    color: #A78BFA !important;
    border: 1px solid #8B5CF6 !important;
    box-shadow: 0 0 12px rgba(139, 92, 246, 0.2) !important;
}

/* ── Typography & Headings ─────────────────────────────────────────── */
h1, h2, h3, h4, h5, h6 {
    color: #F5F3FF !important;
    font-weight: 600 !important;
    letter-spacing: -0.02em !important;
}

p, span, label, div {
    color: #F5F3FF;
}

.text-muted, [data-testid="stCaptionContainer"] p {
    color: #A1A1B5 !important;
    font-size: 0.85rem !important;
}

/* ── Buttons ───────────────────────────────────────────────────────── */
.stButton > button {
    background-color: #181824 !important;
    color: #F5F3FF !important;
    border: 1px solid #29293A !important;
    border-radius: 8px !important;
    padding: 0.5rem 1rem !important;
    font-weight: 500 !important;
    font-size: 0.875rem !important;
    transition: all 0.2s ease !important;
}

.stButton > button:hover {
    background-color: #202030 !important;
    border-color: #8B5CF6 !important;
    color: #A78BFA !important;
    box-shadow: 0 0 12px rgba(139, 92, 246, 0.25) !important;
}

.stButton > button[kind="primary"], .stButton > button[data-testid="baseButton-primary"] {
    background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%) !important;
    color: #FFFFFF !important;
    border: 1px solid #8B5CF6 !important;
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.35) !important;
}

.stButton > button[kind="primary"]:hover {
    background: linear-gradient(135deg, #9F75FF 0%, #8B5CF6 100%) !important;
    border-color: #A78BFA !important;
    box-shadow: 0 4px 16px rgba(139, 92, 246, 0.5) !important;
}

/* ── Inputs & Chat Input ───────────────────────────────────────────── */
.stTextInput > div > div > input,
.stTextArea > div > div > textarea {
    background-color: #12121C !important;
    color: #F5F3FF !important;
    border: 1px solid #29293A !important;
    border-radius: 10px !important;
    padding: 0.65rem 0.85rem !important;
}

.stTextInput > div > div > input:focus,
.stTextArea > div > div > textarea:focus {
    border-color: #8B5CF6 !important;
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.25) !important;
}

[data-testid="stChatInput"] {
    background-color: transparent !important;
}

[data-testid="stChatInput"] textarea {
    background-color: #12121C !important;
    color: #F5F3FF !important;
    border: 1px solid #29293A !important;
    border-radius: 12px !important;
    padding: 0.85rem 1rem !important;
    font-size: 0.95rem !important;
}

[data-testid="stChatInput"] textarea:focus {
    border-color: #8B5CF6 !important;
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3) !important;
}

[data-testid="stChatInput"] button {
    color: #8B5CF6 !important;
}

/* ── Chat Message Bubbles ──────────────────────────────────────────── */
[data-testid="stChatMessage"] {
    background-color: #181824 !important;
    border: 1px solid #29293A !important;
    border-radius: 14px !important;
    padding: 1.1rem !important;
    margin-bottom: 0.85rem !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

[data-testid="stChatMessage"]:has([data-testid="chatAvatarIcon-user"]) {
    background-color: #141420 !important;
    border-color: rgba(139, 92, 246, 0.3) !important;
}

[data-testid="chatAvatarIcon-user"], [data-testid="chatAvatarIcon-assistant"] {
    background-color: #8B5CF6 !important;
    color: #FFFFFF !important;
    border-radius: 8px !important;
}

/* ── Cards & Metrics ───────────────────────────────────────────────── */
[data-testid="stMetric"] {
    background-color: #181824 !important;
    border: 1px solid #29293A !important;
    border-radius: 12px !important;
    padding: 1.1rem 1.25rem !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25) !important;
}

[data-testid="stMetricLabel"] p {
    color: #A1A1B5 !important;
    font-size: 0.8rem !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em !important;
    font-weight: 600 !important;
}

[data-testid="stMetricValue"] div {
    color: #F5F3FF !important;
    font-size: 1.85rem !important;
    font-weight: 700 !important;
}

div[data-testid="stVerticalBlockBorderWrapper"] {
    background-color: #181824 !important;
    border: 1px solid #29293A !important;
    border-radius: 14px !important;
    padding: 1.25rem !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25) !important;
}

/* ── Tables & Dataframes ───────────────────────────────────────────── */
[data-testid="stDataFrame"] {
    background-color: #12121C !important;
    border: 1px solid #29293A !important;
    border-radius: 10px !important;
    overflow: hidden !important;
}

/* ── File Uploader ─────────────────────────────────────────────────── */
[data-testid="stFileUploader"] {
    background-color: #12121C !important;
    border: 1px dashed #29293A !important;
    border-radius: 14px !important;
    padding: 1.5rem !important;
    transition: all 0.2s ease !important;
}

[data-testid="stFileUploader"]:hover {
    border-color: #8B5CF6 !important;
    background-color: #151522 !important;
}

[data-testid="stFileUploaderDropzone"] {
    background-color: transparent !important;
}

[data-testid="stFileUploader"] section {
    background-color: transparent !important;
}

/* ── Code Blocks & Badges ──────────────────────────────────────────── */
code {
    background-color: #12121C !important;
    color: #A78BFA !important;
    border: 1px solid #29293A !important;
    border-radius: 5px !important;
    padding: 0.15rem 0.4rem !important;
    font-size: 0.85em !important;
}

pre {
    background-color: #12121C !important;
    border: 1px solid #29293A !important;
    border-radius: 10px !important;
}

pre code {
    border: none !important;
}

hr {
    border-color: #29293A !important;
    margin: 1.5rem 0 !important;
}

/* ── Scrollbars ────────────────────────────────────────────────────── */
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

::-webkit-scrollbar-track {
    background: #0B0B12;
}

::-webkit-scrollbar-thumb {
    background: #29293A;
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: #8B5CF6;
}

/* ── Custom Utility Badges ─────────────────────────────────────────── */
.badge-purple {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background-color: rgba(139, 92, 246, 0.15);
    color: #A78BFA;
    border: 1px solid rgba(139, 92, 246, 0.35);
    border-radius: 9999px;
    padding: 0.2rem 0.65rem;
    font-size: 0.75rem;
    font-weight: 600;
}

.badge-green {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background-color: rgba(34, 197, 94, 0.15);
    color: #22C55E;
    border: 1px solid rgba(34, 197, 94, 0.35);
    border-radius: 9999px;
    padding: 0.2rem 0.65rem;
    font-size: 0.75rem;
    font-weight: 600;
}

.badge-blue {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background-color: rgba(59, 130, 246, 0.15);
    color: #60A5FA;
    border: 1px solid rgba(59, 130, 246, 0.35);
    border-radius: 9999px;
    padding: 0.2rem 0.65rem;
    font-size: 0.75rem;
    font-weight: 600;
}

.badge-red {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background-color: rgba(239, 68, 68, 0.15);
    color: #EF4444;
    border: 1px solid rgba(239, 68, 68, 0.35);
    border-radius: 9999px;
    padding: 0.2rem 0.65rem;
    font-size: 0.75rem;
    font-weight: 600;
}
</style>
"""


def apply_dark_theme():
    """Injects the dark purple CSS into the current Streamlit page."""
    st.markdown(DARK_PURPLE_CSS, unsafe_allow_html=True)
