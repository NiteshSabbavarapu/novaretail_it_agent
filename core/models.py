from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import pre_delete
from django.dispatch import receiver


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class User(AbstractUser):

    class Role(models.TextChoices):
        EMPLOYEE = "EMPLOYEE", "Employee"
        IT_SUPPORT = "IT_SUPPORT", "IT Support"
        ADMIN = "ADMIN", "Admin"

    email = models.EmailField(unique=True)

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users"
    )

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.EMPLOYEE
    )

    def __str__(self):
        return self.username

class Document(models.Model):

    class Status(models.TextChoices):
        UPLOADED = "uploaded", "Uploaded"
        PROCESSING = "processing", "Processing"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    title = models.CharField(max_length=255)

    file = models.FileField(upload_to="documents/")

    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="uploaded_documents"
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name="documents"
    )

    file_size = models.PositiveBigIntegerField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.UPLOADED
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class DocumentParentChunk(models.Model):
    class ContentType(models.TextChoices):
        TEXT = "text", "Text"
        TABLE = "table", "Table"
        IMAGE = "image", "Image"

    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name="parent_chunks",
    )
    parent_id = models.CharField(max_length=100, db_index=True)
    section_id = models.CharField(max_length=100, blank=True)
    section_title = models.CharField(max_length=255, blank=True)
    content_type = models.CharField(
        max_length=20,
        choices=ContentType.choices,
        default=ContentType.TEXT,
    )
    content = models.TextField()
    page_start = models.PositiveIntegerField()
    page_end = models.PositiveIntegerField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]
        constraints = [
            models.UniqueConstraint(
                fields=["document", "parent_id"],
                name="unique_document_parent_id",
            ),
        ]

    def __str__(self):
        return f"{self.document.title} - Parent {self.parent_id} ({self.content_type})"


class DocumentChunk(models.Model):
    class ContentType(models.TextChoices):
        TEXT = "text", "Text"
        TABLE = "table", "Table"
        IMAGE = "image", "Image"

    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name="chunks",
    )
    parent = models.ForeignKey(
        DocumentParentChunk,
        on_delete=models.CASCADE,
        related_name="children",
        null=True,
        blank=True,
    )
    parent_id_str = models.CharField(max_length=100, blank=True, db_index=True)
    section_id = models.CharField(max_length=100, blank=True)
    section_title = models.CharField(max_length=255, blank=True)
    content_type = models.CharField(
        max_length=20,
        choices=ContentType.choices,
        default=ContentType.TEXT,
    )
    content = models.TextField()
    chunk_index = models.PositiveIntegerField()
    page_number = models.PositiveIntegerField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["chunk_index"]
        constraints = [
            models.UniqueConstraint(
                fields=["document", "chunk_index"],
                name="unique_document_chunk_index",
            ),
        ]

    def __str__(self):
        return f"{self.document.title} — chunk {self.chunk_index}"

class Conversation(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="conversations"
    )

    title = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Conversation {self.id} - {self.user.username}"

class ChatMessage(models.Model):

    class Role(models.TextChoices):
        USER = "user", "User"
        ASSISTANT = "assistant", "Assistant"

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    role = models.CharField(
        max_length=10,
        choices=Role.choices
    )

    content = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.role} - Conversation {self.conversation_id}"


def get_anonymous_user():
    """
    Returns (or creates) a shared enterprise user for anonymous access.
    Guarantees department_id=1 and role=EMPLOYEE without breaking foreign key constraints.
    """
    dept, _ = Department.objects.get_or_create(
        id=1,
        defaults={"name": "Information Technology", "description": "IT Department"}
    )
    user, _ = User.objects.get_or_create(
        username="anonymous",
        defaults={
            "email": "anonymous@novaretail.internal",
            "department": dept,
            "role": User.Role.EMPLOYEE,
        }
    )
    if user.department_id != dept.id:
        user.department = dept
        user.save(update_fields=["department"])
    return user


@receiver(pre_delete, sender=Document)
def cleanup_document_vectors_on_delete(sender, instance, **kwargs):
    """Cleans up Pinecone vectors when a Document is deleted from PostgreSQL."""
    try:
        from core.vector_utils import delete_document_vectors
        chunk_ids = list(instance.chunks.values_list("id", flat=True))
        delete_document_vectors(instance.id, chunk_ids=chunk_ids)
    except Exception:
        pass


