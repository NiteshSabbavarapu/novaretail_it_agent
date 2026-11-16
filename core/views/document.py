import logging

from django.db import transaction
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.ingestion.pipeline import DocumentIngestionPipeline
from core.models import Document, DocumentChunk, DocumentParentChunk
from core.serializers import DocumentSerializer
from core.vector_utils import index_document_chunks, delete_document_vectors
logger = logging.getLogger(__name__)

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
        document.status = Document.Status.PROCESSING
        document.save(update_fields=["status"])
        try:
            pipeline = DocumentIngestionPipeline()
            parents, children = pipeline.process_pdf(document.file.path, document.id)
            with transaction.atomic():
                DocumentChunk.objects.filter(document=document).delete()
                DocumentParentChunk.objects.filter(document=document).delete()
                parent_objs = [
                    DocumentParentChunk(
                        document=document,
                        parent_id=p.parent_id,
                        section_id=p.section_id,
                        section_title=p.section_title,
                        content_type=p.content_type,
                        content=p.content,
                        page_start=p.page_start,
                        page_end=p.page_end,
                        metadata=p.metadata,
                    )
                    for p in parents
                ]
                created_parents = DocumentParentChunk.objects.bulk_create(parent_objs)
                parent_map = {p.parent_id: p for p in created_parents}

                # Bulk create child chunks
                child_objs = [
                    DocumentChunk(
                        document=document,
                        parent=parent_map.get(c.parent_id_str),
                        parent_id_str=c.parent_id_str,
                        section_id=c.section_id,
                        section_title=c.section_title,
                        content_type=c.content_type,
                        content=c.content,
                        page_number=c.page_number,
                        chunk_index=c.chunk_index,
                        metadata=c.metadata,
                    )
                    for c in children
                ]
                DocumentChunk.objects.bulk_create(child_objs)

            # Pinecone indexing with safe cleanup on failure
            try:
                indexed_count = index_document_chunks(document.id)
                logger.info(f"Successfully indexed {indexed_count} chunks in Pinecone for doc {document.id}")
                document.status = Document.Status.COMPLETED
                document.save(update_fields=["status"])
            except Exception as pinecone_err:
                delete_document_vectors(document.id)
                raise pinecone_err

        except Exception as exc:
            logger.error(f"PDF processing failed for doc {document.id}: {exc}")
            document.status = Document.Status.FAILED
            document.save(update_fields=["status"])
            return Response(
                {"detail": f"PDF processing failed: {exc}"},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        resp_data = serializer.data
        resp_data["chunk_count"] = document.chunks.count()
        resp_data["parent_chunk_count"] = document.parent_chunks.count()
        return Response(resp_data, status=status.HTTP_201_CREATED)
