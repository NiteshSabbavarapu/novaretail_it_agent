from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import Document, DocumentChunk
from core.pdf_utils import extract_pdf_pages, chunk_text
from core.serializers import DocumentSerializer
from core.vector_utils import index_document_chunks

class DocumentUploadView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        docs = Document.objects.select_related("department").all().order_by("-created_at")
        data = [
            {
                "id": doc.id,
                "title": doc.title,
                "department": doc.department_id,
                "department_name": doc.department.name if doc.department else "IT",
                "file_size": doc.file_size,
                "status": doc.status,
                "chunk_count": doc.chunks.count(),
                "created_at": doc.created_at.isoformat(),
            }
            for doc in docs
        ]
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = DocumentSerializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        document = serializer.save()

        try:
            pages = extract_pdf_pages(document.file.path)

            chunk_index = 0
            chunks_to_create = []

            for page in pages:
                for chunk_content in chunk_text(page["text"]):
                    chunks_to_create.append(
                        DocumentChunk(
                            document=document,
                            content=chunk_content,
                            chunk_index=chunk_index,
                            page_number=page["page_number"],
                        )
                    )
                    chunk_index += 1

            if chunks_to_create:
                DocumentChunk.objects.bulk_create(chunks_to_create)

                indexed_count = index_document_chunks(document.id)

                print(f"Successfully indexed {indexed_count} chunks in Pinecone")

            document.status = document.Status.COMPLETED
            document.save(update_fields=["status"])

        except Exception as exc:
            document.status = document.Status.FAILED
            document.save(update_fields=["status"])
            return Response(
                {"detail": f"PDF processing failed: {exc}"},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        return Response(serializer.data, status=status.HTTP_201_CREATED)
