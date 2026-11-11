from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from core.views import (
    DocumentUploadView,
    HealthCheckView,
    ConversationListView,
    ConversationDetailView,
)
from core.views.search import HybridSearchView
from core.views.user import UserRegistrationView, UserLoginView

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health-check"),
    path("conversations/", ConversationListView.as_view(), name="conversation-list"),
    path("conversations/<int:pk>/", ConversationDetailView.as_view(), name="conversation-detail"),
    path("documents/", DocumentUploadView.as_view(), name="document-list"),
    path("documents/upload/", DocumentUploadView.as_view(), name="document-upload"),
    path("search/", HybridSearchView.as_view(), name="hybrid-search"),
    path("auth/register/", UserRegistrationView.as_view(), name="user-register"),
    path("auth/login/", UserLoginView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

