
import json
import logging

from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from langchain_core.messages import HumanMessage, ToolMessage, AIMessage

from core.agents import agent_graph
from core.llm_utils import correct_query
from core.models import Conversation, ChatMessage, User, get_anonymous_user


logger = logging.getLogger(__name__)


def extract_tool_results(messages):

    retrieved_chunks = []
    web_results = []

    for message in messages:

        if not isinstance(message, ToolMessage):
            continue

        try:
            data = json.loads(message.content)
        except (json.JSONDecodeError, TypeError):
            continue

        if not data.get("success"):
            continue

        if message.name == "search_knowledge_base":

            retrieved_chunks.extend(
                data.get("chunks", [])
            )

        elif message.name == "search_web":

            web_results.extend(
                data.get("results", [])
            )

    return retrieved_chunks, web_results


def get_answer(messages):

    for message in reversed(messages):

        if isinstance(message, AIMessage) and not message.tool_calls:

            content = message.content

            if isinstance(content, str):
                return content

            if isinstance(content, list):

                return "".join(
                    block.get("text", "")
                    for block in content
                    if isinstance(block, dict)
                )

    return "I could not generate a response."


class HybridSearchView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        query = request.data.get("query")

        if not isinstance(query, str) or not query.strip():

            return Response(
                {"error": "A valid query is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        query = query.strip()
        # Only run query correction for sentences longer than 3 words, preserving short replies like 'No', 'Yes', 'Connection timed out'
        if len(query.split()) > 3:
            query = correct_query(query)

        department_id = 1  # IT department (shared demo workspace)

        conversation_id = request.data.get("conversation_id")

        if conversation_id:

            conversation = Conversation.objects.filter(
                id=conversation_id
            ).first()

            if not conversation:
                raise NotFound("Conversation not found.")

        else:

            anon_user = get_anonymous_user()
            conversation = Conversation.objects.create(
                user=anon_user,
                title=query[:255]
            )

        # Retrieve prior conversation messages to provide complete conversational context to the agent
        history_messages = []
        for msg in conversation.messages.order_by("created_at"):
            if msg.role == ChatMessage.Role.USER:
                history_messages.append(HumanMessage(content=msg.content))
            elif msg.role == ChatMessage.Role.ASSISTANT:
                history_messages.append(AIMessage(content=msg.content))

        # Record current user turn in database and conversation context
        ChatMessage.objects.create(
            conversation=conversation,
            role=ChatMessage.Role.USER,
            content=query
        )
        history_messages.append(HumanMessage(content=query))
        turn_start_index = len(history_messages)

        try:
            result = agent_graph.invoke(
                {
                    "messages": history_messages,
                    "department_id": department_id
                },
                config={
                    "recursion_limit": 12
                }
            )

            messages = result["messages"]

            answer = get_answer(messages)

            # Extract tool results generated during this conversational turn
            turn_new_messages = messages[turn_start_index - 1:]
            retrieved_chunks, web_results = extract_tool_results(
                turn_new_messages
            )

            ChatMessage.objects.create(
                conversation=conversation,
                role=ChatMessage.Role.ASSISTANT,
                content=answer
            )

            return Response({

                "conversation_id": conversation.id,

                "query": query,

                "route": result.get("route", "it_support"),

                "answer": answer,

                "sources": [
                    {
                        "document_id": chunk["document_id"],
                        "page_number": chunk["page_number"]
                    }
                    for chunk in retrieved_chunks
                ],

                "web_results": web_results

            })

        except Exception:

            logger.exception(
                "NovaRetail agent execution failed"
            )

            return Response(
                {
                    "error": "Something went wrong while processing your request."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
