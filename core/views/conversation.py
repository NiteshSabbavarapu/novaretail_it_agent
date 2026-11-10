from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import NotFound

from core.models import Conversation, ChatMessage


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            "status": "operational",
            "service": "NovaRetail",
            "message": "All core services operational"
        })


class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = Conversation.objects.filter(user=request.user).order_by("-updated_at")
        data = [
            {
                "id": conv.id,
                "title": conv.title or f"Conversation #{conv.id}",
                "created_at": conv.created_at.isoformat(),
                "updated_at": conv.updated_at.isoformat(),
                "message_count": conv.messages.count(),
            }
            for conv in conversations
        ]
        return Response(data)


class ConversationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        conv = Conversation.objects.filter(id=pk, user=request.user).first()
        if not conv:
            raise NotFound("Conversation not found.")

        messages = [
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "created_at": msg.created_at.isoformat(),
            }
            for msg in conv.messages.order_by("created_at")
        ]

        return Response({
            "id": conv.id,
            "title": conv.title or f"Conversation #{conv.id}",
            "created_at": conv.created_at.isoformat(),
            "updated_at": conv.updated_at.isoformat(),
            "messages": messages,
        })

