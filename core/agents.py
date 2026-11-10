import json
import logging
import uuid
from typing import TypedDict, Annotated, Literal

from langchain_core.messages import (
    AnyMessage,
    SystemMessage,
    HumanMessage,
    AIMessage,
    ToolMessage,
)
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field

from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode

from core.tools import tools, search_knowledge_base, search_web

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# LLMs
# ---------------------------------------------------------------------------

llm = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0
)

llm_with_tools = llm.bind_tools(tools)


# ---------------------------------------------------------------------------
# Intent & Retrieval Classifier Schema
# ---------------------------------------------------------------------------

class RouteClassification(BaseModel):
    route: Literal["small_talk", "knowledge_base", "it_support", "web_search", "unknown"] = Field(
        description="The primary category of the user's latest query."
    )
    requires_retrieval: bool = Field(
        description="True ONLY if fresh knowledge base or web search retrieval is strictly required. False if small talk, general IT support discussion, or if the answer is already present in conversation history."
    )


_classifier_llm = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0
).with_structured_output(RouteClassification)

_CLASSIFIER_SYSTEM = """You are an intent classifier and retrieval evaluator for NovaRetail's AI IT Support Assistant.

Analyze the user's latest message in the context of the recent conversation history.

1. Classify the user's intent into exactly one route:
- small_talk: greetings, casual chat, thanks, farewells, slang (e.g. "yo bro", "how's it going", "cheers").
- knowledge_base: questions about internal company documents, projects (e.g. SAHA project), policies, employees, procedures, or organizational information.
- it_support: IT troubleshooting, technical issues, VPN, access problems, software/hardware errors, connectivity issues.
- web_search: requests for external or real-time internet information (news, latest software versions, public documentation).

Important context rules for route:
- A short reply such as "No.", "Yes.", "Still not working.", or "It failed." continues the context of prior turns (typically it_support). Never classify these as small_talk.

2. Determine requires_retrieval (boolean):
- Set requires_retrieval = true ONLY if:
  (a) The route is "knowledge_base" or "web_search", AND
  (b) The specific information requested is NOT already answered or present in the previous messages of the conversation history.
- Set requires_retrieval = false if:
  (a) The route is "small_talk" or "it_support", OR
  (b) The question can be answered using information already provided earlier in the conversation history (e.g., repeated questions or follow-ups on previously retrieved facts).

Respond ONLY with the structured classification object."""


def _classifier_safe_messages(messages: list) -> list:
    """
    Sanitize messages before passing to the classifier LLM.
    Strips raw ToolMessages and cleans AIMessages with tool_calls
    so the classifier only sees human/assistant dialogue.
    Returns up to the last 6 messages.
    """
    safe = []
    for m in messages:
        if isinstance(m, ToolMessage):
            # Convert tool output snippet into readable context if helpful
            continue
        if isinstance(m, AIMessage) and getattr(m, "tool_calls", None):
            if m.content:
                safe.append(AIMessage(content=str(m.content)))
        elif isinstance(m, (HumanMessage, AIMessage)):
            safe.append(m)
    return safe[-6:]


def classify_intent(messages: list) -> RouteClassification:
    """
    Invoke the structured classifier LLM to determine both the route and
    whether fresh retrieval is required.
    Falls back to route='unknown' and requires_retrieval=False on error.
    """
    try:
        recent = _classifier_safe_messages(messages)
        result: RouteClassification = _classifier_llm.invoke([
            SystemMessage(content=_CLASSIFIER_SYSTEM),
            *recent
        ])
        return result
    except Exception:
        logger.warning("classify_intent failed; falling back to unknown", exc_info=True)
        return RouteClassification(route="unknown", requires_retrieval=False)


# ---------------------------------------------------------------------------
# State
# ---------------------------------------------------------------------------

class AgentState(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]
    department_id: int
    route: Literal[
        "small_talk",
        "knowledge_base",
        "web_search",
        "it_support",
        "unknown"
    ]
    tools_executed: bool


# ---------------------------------------------------------------------------
# System Prompt
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are NovaRetail's enterprise interactive AI IT Support Engineer.
You troubleshoot employee IT issues through an interactive diagnostic conversation, exactly like an experienced human IT support engineer.

Core Personality & Style:
- Professional, helpful, practical, and conversational.
- Keep normal responses short and focused: approximately 1 to 3 short sentences.
- Never use unnecessary technical jargon.
- Never expose internal tool names, raw JSON, or implementation details.

Mandatory Rules:
1. One Action & One Question at a Time:
   - Suggest only ONE practical troubleshooting action at a time.
   - Ask only ONE clear question at a time to check what happened or request details.
   - Stop and wait for the employee's reply before suggesting the next step.
2. No Unsolicited Checklist Dumping:
   - NEVER dump a full troubleshooting checklist or multi-step list in normal conversation.
   - ONLY provide a complete troubleshooting guide or checklist if the employee explicitly asks for one (e.g., "give me the complete troubleshooting guide", "show me all steps").
3. Active Conversational Memory:
   - Remember and respect all previous messages in the conversation.
   - NEVER re-ask questions the employee already answered (e.g. if they already stated Google works, VPN status, or provided an error message).
   - Adapt your next troubleshooting step dynamically based on what the employee just told you.
   - If the user says they completed an action (e.g. "I connected to the VPN"), acknowledge it and test the next logical check.
4. Tool Usage:
   - Use `check_service_status` when the employee reports that NovaRetail or internal services are unreachable, down, or returning connection timeouts.
   - Use `search_knowledge_base` when you need internal company policies, VPN configurations, or IT documentation.
   - Use `search_web` only when external software, driver, or general internet technical information is needed.
   - Do NOT call tools for basic greetings or simple conversational exchanges.
   - If a tool fails or reports unavailable, explain briefly and proceed with practical troubleshooting.
5. Problem Resolution & Escalation:
   - Do not assume or claim a problem is resolved until the employee explicitly confirms it works.
   - If troubleshooting cannot resolve the issue, advise contacting the enterprise IT support helpdesk with the diagnostics gathered.
6. Casual Conversation:
   - For greetings (e.g., "Hi", "Hello", "How are you?") or inquiries about what you can do, reply warmly and concisely (1-2 sentences) and ask how you can assist with IT today.
"""


# ---------------------------------------------------------------------------
# Nodes
# ---------------------------------------------------------------------------

def agent_node(state: AgentState):
    """
    Main agent execution node.
    - If the LLM generates tool_calls, we determine the route from the requested tool
      and flag that tools are queued.
    - If no tool_calls are generated and tools were already executed, the agent
      produces the final evidence-grounded answer.
    """
    response = llm_with_tools.invoke([
        SystemMessage(content=SYSTEM_PROMPT),
        *state["messages"]
    ])

    tool_calls = getattr(response, "tool_calls", None) or []
    if tool_calls:
        first_tool = tool_calls[0].get("name", "")
        if first_tool == "check_service_status":
            route = "it_support"
        elif first_tool == "search_knowledge_base":
            route = "knowledge_base"
        elif first_tool == "search_web":
            route = "web_search"
        else:
            route = "it_support"

        return {
            "messages": [response],
            "route": route,
            "tools_executed": True
        }

    return {"messages": [response]}


def classifier_node(state: AgentState):
    """
    Fallback classification node, invoked only when the main agent did NOT
    request a tool call.
    Uses the separate classifier to determine:
    1. Route category
    2. Whether fresh retrieval is required
    """
    messages = state["messages"]

    try:
        classification = classify_intent(messages)
        route = classification.route
        requires_retrieval = classification.requires_retrieval
    except Exception:
        logger.warning("Classifier invocation failed in node; defaulting to unknown", exc_info=True)
        route = "unknown"
        requires_retrieval = False

    # If retrieval is not needed (small_talk, it_support, unknown, or answer in history)
    if not requires_retrieval or route not in ("knowledge_base", "web_search"):
        return {
            "route": route,
            "tools_executed": True  # marks cycle complete so after_classifier exits
        }

    # Retrieval is required: route to forced_tool_node
    return {
        "route": route,
        "tools_executed": False
    }


def forced_tool_node(state: AgentState):
    """
    Executes retrieval when the agent did not call a tool but the classifier
    determined that retrieval is required.
    Uses the authenticated department_id from state (never trusting LLM input).
    Appends a synthetic AIMessage + ToolMessage pair so the agent can generate
    an evidence-grounded final answer and views/search.py can capture sources.
    """
    route = state["route"]
    department_id = state["department_id"]
    messages = state["messages"]

    # Extract user's latest query
    last_human = ""
    for m in reversed(messages):
        if isinstance(m, HumanMessage):
            last_human = str(m.content).strip()
            break

    if route == "knowledge_base":
        tool_name = "search_knowledge_base"
        tool_fn = search_knowledge_base
        tool_input = {"query": last_human, "department_id": department_id}
    else:
        tool_name = "search_web"
        tool_fn = search_web
        tool_input = {"query": last_human}

    try:
        tool_result = tool_fn.invoke(tool_input)
    except Exception:
        logger.warning("forced_tool_node: execution failed", exc_info=True)
        tool_result = json.dumps({"success": False, "error": "Retrieval failed."})

    call_id = f"forced_{uuid.uuid4().hex[:12]}"

    synthetic_ai = AIMessage(
        content="",
        tool_calls=[{
            "id": call_id,
            "name": tool_name,
            "args": {k: v for k, v in tool_input.items() if k != "department_id"}
        }]
    )

    synthetic_tool = ToolMessage(
        content=tool_result,
        tool_call_id=call_id,
        name=tool_name
    )

    return {
        "messages": [synthetic_ai, synthetic_tool],
        "tools_executed": True
    }


# ---------------------------------------------------------------------------
# Edge Conditional Functions
# ---------------------------------------------------------------------------

def after_agent(state: AgentState) -> str:
    """
    Decision point after agent_node:
    1. If the agent requested tool_calls -> execute via ToolNode ("tools").
    2. If tools were already executed in this turn (either normal or forced) -> END.
    3. If the agent did not request a tool on its first pass -> evaluate intent ("classifier").
    """
    last_msg = state["messages"][-1]
    tool_calls = getattr(last_msg, "tool_calls", None) or []

    if tool_calls:
        return "tools"

    if state.get("tools_executed"):
        return END

    return "classifier"


def after_classifier(state: AgentState) -> str:
    """
    Decision point after classifier_node:
    - If tools_executed is True -> no retrieval needed; finish (END).
    - If tools_executed is False -> retrieval required; route to "forced_tool".
    """
    if state.get("tools_executed"):
        return END
    return "forced_tool"


# ---------------------------------------------------------------------------
# Graph Definition
# ---------------------------------------------------------------------------

tool_node = ToolNode(tools)

graph_builder = StateGraph(AgentState)

graph_builder.add_node("agent", agent_node)
graph_builder.add_node("tools", tool_node)
graph_builder.add_node("classifier", classifier_node)
graph_builder.add_node("forced_tool", forced_tool_node)

graph_builder.add_edge(START, "agent")

graph_builder.add_conditional_edges(
    "agent",
    after_agent,
    {
        "tools": "tools",
        "classifier": "classifier",
        END: END
    }
)

# Normal tools node returns to agent to generate evidence-grounded answer
graph_builder.add_edge("tools", "agent")

# Classifier routes either to forced retrieval or ends
graph_builder.add_conditional_edges(
    "classifier",
    after_classifier,
    {
        "forced_tool": "forced_tool",
        END: END
    }
)

# Forced tool node returns to agent to generate evidence-grounded answer
graph_builder.add_edge("forced_tool", "agent")

agent_graph = graph_builder.compile()
