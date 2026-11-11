from rest_framework import serializers

from core.models import Document, get_anonymous_user
from core.validators.pdf import validate_pdf


class DocumentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Document
        fields = ["id", "title", "file", "department", "file_size", "status", "created_at"]
        read_only_fields = ["id", "file_size", "status", "created_at"]
        extra_kwargs = {
            "file": {"validators": [validate_pdf]},
        }

    def create(self, validated_data):
        user = self.context["request"].user if (self.context.get("request") and getattr(self.context["request"].user, "is_authenticated", False)) else get_anonymous_user()
        validated_data["uploaded_by"] = user
        validated_data["file_size"] = validated_data["file"].size
        return super().create(validated_data)

