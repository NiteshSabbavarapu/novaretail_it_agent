
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from core.models import (
    Department,
    User,
    Document,
    DocumentChunk,
    Conversation,
    ChatMessage,
)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "created_at")
    search_fields = ("name",)
    ordering = ("name",)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = (
        "username",
        "email",
        "role",
        "department",
        "is_staff",
        "is_active",
    )

    list_filter = ("role", "department", "is_staff", "is_active")
    search_fields = ("username", "email")

    fieldsets = UserAdmin.fieldsets + (
        ("Additional Information", {
            "fields": ("role", "department")
        }),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Additional Information", {
            "fields": ("email", "role", "department")
        }),
    )


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "uploaded_by",
        "department",
        "file_size",
        "status",
        "created_at",
    )

    list_filter = ("status", "department", "created_at")
    search_fields = ("title", "uploaded_by__username")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)


@admin.register(DocumentChunk)
class DocumentChunkAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "document",
        "chunk_index",
        "page_number",
        "created_at",
    )

    list_filter = ("document",)
    search_fields = ("content", "document__title")
    readonly_fields = ("created_at",)
    ordering = ("document", "chunk_index")


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "title",
        "created_at",
        "updated_at",
    )

    search_fields = ("user__username", "title")
    list_filter = ("created_at", "updated_at")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-updated_at",)


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "conversation",
        "role",
        "short_content",
        "created_at",
    )

    list_filter = ("role", "created_at")
    search_fields = ("content", "conversation__user__username")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)

    @admin.display(description="Content")
    def short_content(self, obj):
        return obj.content[:80]
