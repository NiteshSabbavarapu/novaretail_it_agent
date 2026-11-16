"""Simple, section-aware parent-child text chunker using LangChain."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any
from langchain_text_splitters import RecursiveCharacterTextSplitter
from core.ingestion.section_detector import DetectedSection


@dataclass
class GeneratedParentChunk:
    parent_id: str
    section_id: str
    section_title: str
    content_type: str
    content: str
    page_start: int
    page_end: int
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class GeneratedChildChunk:
    parent_id_str: str
    section_id: str
    section_title: str
    content_type: str
    content: str
    page_number: int
    chunk_index: int
    metadata: dict[str, Any] = field(default_factory=dict)


class TextChunker:
    """Builds parent chunks from sections and splits into 1000/150 child chunks."""

    def __init__(
        self,
        target_parent_size: int = 2500,
        max_parent_size: int = 3500,
        child_chunk_size: int = 1000,
        child_chunk_overlap: int = 150,
    ):
        self.target_parent_size = target_parent_size
        self.max_parent_size = max_parent_size
        self.child_splitter = RecursiveCharacterTextSplitter(
            chunk_size=child_chunk_size,
            chunk_overlap=child_chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""],
            keep_separator=True,
        )

    def chunk_sections(
        self,
        sections: list[DetectedSection],
        document_id: int | str = 0,
        start_chunk_index: int = 0,
    ) -> tuple[list[GeneratedParentChunk], list[GeneratedChildChunk]]:
        parents: list[GeneratedParentChunk] = []
        children: list[GeneratedChildChunk] = []
        current_idx = start_chunk_index
        parent_counter = 0

        for sec in sections:
            content = sec.content.strip()
            if not content:
                continue

            full_text = f"Section: {sec.title}\n\n{content}"

            if len(full_text) <= self.max_parent_size:
                parent_counter += 1
                p_id = f"doc_{document_id}_p_{parent_counter}"
                p = GeneratedParentChunk(
                    parent_id=p_id,
                    section_id=sec.section_id,
                    section_title=sec.title,
                    content_type="text",
                    content=full_text,
                    page_start=sec.page_start,
                    page_end=sec.page_end,
                    metadata={"document_id": document_id, "level": sec.level},
                )
                parents.append(p)

                for c_text in self.child_splitter.split_text(full_text):
                    children.append(
                        GeneratedChildChunk(
                            parent_id_str=p_id,
                            section_id=sec.section_id,
                            section_title=sec.title,
                            content_type="text",
                            content=c_text,
                            page_number=sec.page_start,
                            chunk_index=current_idx,
                            metadata={"document_id": document_id, "parent_id": p_id},
                        )
                    )
                    current_idx += 1
            else:
                p_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=self.target_parent_size,
                    chunk_overlap=200,
                    separators=["\n\n", "\n", ". ", " ", ""],
                    keep_separator=True,
                )
                sub_parents = p_splitter.split_text(full_text)
                for part_idx, sub_p_text in enumerate(sub_parents, start=1):
                    parent_counter += 1
                    p_id = f"doc_{document_id}_p_{parent_counter}"
                    p = GeneratedParentChunk(
                        parent_id=p_id,
                        section_id=sec.section_id,
                        section_title=f"{sec.title} (Part {part_idx})",
                        content_type="text",
                        content=sub_p_text,
                        page_start=sec.page_start,
                        page_end=sec.page_end,
                        metadata={"document_id": document_id, "part": part_idx},
                    )
                    parents.append(p)

                    for c_text in self.child_splitter.split_text(sub_p_text):
                        children.append(
                            GeneratedChildChunk(
                                parent_id_str=p_id,
                                section_id=sec.section_id,
                                section_title=sec.title,
                                content_type="text",
                                content=c_text,
                                page_number=sec.page_start,
                                chunk_index=current_idx,
                                metadata={"document_id": document_id, "parent_id": p_id},
                            )
                        )
                        current_idx += 1

        return parents, children
