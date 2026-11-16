"""Simple Document Ingestion Pipeline coordinating text, table, and image extraction."""

from __future__ import annotations

import pymupdf

from core.ingestion.image_chunker import ImageChunker
from core.ingestion.section_detector import DocumentLayoutAnalyzer
from core.ingestion.table_chunker import TableChunker
from core.ingestion.text_chunker import TextChunker, GeneratedParentChunk, GeneratedChildChunk


class DocumentIngestionPipeline:

    def __init__(
            self,
            target_parent_size: int = 2500,
            max_parent_size: int = 3500,
            child_chunk_size: int = 1000,
            child_chunk_overlap: int = 150,
            enable_vision: bool | None = None,
    ):
        self.text_chunker = TextChunker(
            target_parent_size=target_parent_size,
            max_parent_size=max_parent_size,
            child_chunk_size=child_chunk_size,
            child_chunk_overlap=child_chunk_overlap,
        )
        self.table_chunker = TableChunker()
        self.image_chunker = ImageChunker(enable_vision=enable_vision)

    def process_pdf(
            self,
            file_path: str,
            document_id: int | str,
    ) -> tuple[list[GeneratedParentChunk], list[GeneratedChildChunk]]:
        doc = pymupdf.open(file_path)
        try:
            return self.process_document(doc, document_id)
        finally:
            doc.close()

    def process_document(
            self,
            doc: pymupdf.Document,
            document_id: int | str,
    ) -> tuple[list[GeneratedParentChunk], list[GeneratedChildChunk]]:
        all_parents: list[GeneratedParentChunk] = []
        all_children: list[GeneratedChildChunk] = []

        sections = DocumentLayoutAnalyzer(doc).extract_sections()
        t_parents, t_children = self.text_chunker.chunk_sections(
            sections, document_id=document_id, start_chunk_index=0
        )
        all_parents.extend(t_parents)
        all_children.extend(t_children)

        tables = self.table_chunker.extract_tables_from_doc(doc)
        tab_parents, tab_children = self.table_chunker.chunk_tables(
            tables,
            document_id=document_id,
            start_chunk_index=len(all_children),
            start_parent_index=len(all_parents),
        )
        all_parents.extend(tab_parents)
        all_children.extend(tab_children)

        images = self.image_chunker.extract_images_from_doc(doc)
        img_parents, img_children = self.image_chunker.chunk_images(
            images,
            document_id=document_id,
            start_chunk_index=len(all_children),
            start_parent_index=len(all_parents),
        )
        all_parents.extend(img_parents)
        all_children.extend(img_children)

        return all_parents, all_children
