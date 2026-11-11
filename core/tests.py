from django.test import TestCase
from rest_framework.test import APIClient
from core.models import get_anonymous_user, Department, User


class AnonymousAccessTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_anonymous_user_helper(self):
        user = get_anonymous_user()
        self.assertEqual(user.username, "anonymous")
        self.assertEqual(user.department_id, 1)

    def test_health_check_unauthenticated(self):
        resp = self.client.get("/api/health/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json().get("status"), "operational")

    def test_conversations_unauthenticated(self):
        resp = self.client.get("/api/conversations/")
        self.assertEqual(resp.status_code, 200)

    def test_documents_list_unauthenticated(self):
        resp = self.client.get("/api/documents/")
        self.assertEqual(resp.status_code, 200)

