# NovaRetail: Enterprise Agentic RAG Intelligence Dashboard

A dark-themed, enterprise observability and evaluation frontend built with **React, Vite, Tailwind CSS, Lucide React, and Recharts**.

Designed specifically for **technical interview demonstrations** and **deep inspection of Agentic RAG execution**, this interface visually decomposes how queries move through **intent routing, hybrid retrieval, Reciprocal Rank Fusion (RRF), Cross-Encoder reranking, relevance gating, automated fallback, and grounded generation**.

---

## 🛠️ Technology Stack

- **Framework:** React 18 + Vite 6
- **Styling:** Tailwind CSS (deep charcoal theme inspired by Linear, LangSmith, and Vercel)
- **Icons:** Lucide React
- **Analytics & Visualizations:** Recharts (Area, Bar, Donut charts)
- **HTTP Client:** Axios (configured with JWT interceptors & token refresh)
- **Routing:** React Router v6

---

## 🚀 Navigation & Core Sections

1. **Overview Dashboard (`/`):**
   - High-level KPIs: Total queries, Knowledge Base queries, Web Search queries, Fallback count, Average latency, Document count, Indexed Pinecone chunks.
   - Interactive charts: Query routing distribution, stage latency breakdown, agent success/fallback rates, and query volume over time.
   - Explicit toggle between **Sample Fleet Telemetry** and **Live Session Metrics**.

2. **AI Playground (`/playground`) — Primary Page:**
   - Real-time conversation thread with user bubbles, assistant answers, and response latency.
   - **Route Indicator:** Visual badges for `Knowledge Base Agent`, `Web Search Agent`, and `Fallback Triggered`.
   - **Source Attribution:** Verbatim document citations (`Doc #12, p.3, chunk 104`).
   - **One-Click Interview Presets:** Pre-configured queries to test all three major architectural routes in seconds.
   - **Synchronized Execution Trace Panel:** Right-hand panel updating with chronological stage execution.

3. **Execution Traces (`/traces`):**
   - Detailed inspection of all **8 sequential pipeline stages**:
     1. **Query Received:** Original query, normalization, length, detected language.
     2. **Router Agent:** Model, selected route, classification confidence, decision rationale.
     3. **Hybrid Retrieval:** Separate dense semantic search (Pinecone cosine) & sparse keyword search (BM25Okapi).
     4. **Reciprocal Rank Fusion (RRF):** Merged candidate list, $k=60$ constant, semantic vs BM25 ranks.
     5. **Cross-Encoder Reranking:** Before/after ranking comparison with delta indicators (+1, -1, 0).
     6. **Relevance Evaluation:** Threshold gate ($\ge 0.50$), grounding evidence, pass/fail status.
     7. **Fallback & Agent Handoff:** Fallback trigger reason, destination agent, Tavily web results.
     8. **Answer Generation:** Groq-hosted `openai/gpt-oss-120b`, execution latency, token counts.

4. **Retrieval Explorer (`/retrieval`):**
   - Dedicated technical tabbed viewer: **Semantic Search**, **BM25**, **RRF**, and **Reranking**.
   - Displays Chunk ID, Document ID, Page Number, Content preview, Relevant scores, and Ranks.
   - RRF formula comparison table and Cross-Encoder rank shift visualization.

5. **Agent Workflow (`/workflow`):**
   - Interactive SVG/React workflow graph visualizer.
   - Displays LangGraph state machine nodes: Router, KB Agent, Web Search Agent, Relevance Evaluator, Fallback Handler, Answer Generator.
   - Active execution path highlighted per query with an interactive Node Inspector Drawer.

6. **Knowledge Base (`/knowledge-base`):**
   - PDF drag-and-drop file upload with client-side header and size validation.
   - Connects to `POST /api/documents/upload/`.
   - Real-time ingestion progress bar and active document registry with chunk inspection.

7. **Conversations (`/conversations`):**
   - Historical conversation threads, route tags, turn counts, and one-click transition to Playground.

8. **Settings (`/settings`):**
   - Configure Backend API Base URL (default `/api` pointing to Django port 8000).
   - Telemetry Mode Toggle: **Interview Simulation** vs **Live Backend DRF**.
   - Hyperparameter sliders: RRF constant $k$, Top K candidates, vector partition info.

---

## 🏃 Quick Start

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Start Vite development server
npm run dev

# 3. Build for production
npm run build
```

---

## 🔗 Backend Contract Alignment

- Connects to existing Django REST Framework endpoints:
  - `POST /api/search/`
  - `POST /api/documents/upload/`
  - `POST /api/auth/login/`
  - `POST /api/auth/register/`
  - `POST /api/auth/refresh/`
- Zero fabrication: Real API responses are cleanly distinguished from interview simulation previews.
- Forward-compatible: The frontend trace builder directly adopts `execution_trace` if returned by the backend in future releases.

