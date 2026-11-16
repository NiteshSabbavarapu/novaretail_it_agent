"""Simple, structure-preserving table extraction and row-based chunking."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any
import pymupdf

from core.ingestion.text_chunker import GeneratedParentChunk, GeneratedChildChunk


def table_to_markdown(headers: list[str], rows: list[list[Any]]) -> str:
    """Formats headers and rows into clean Markdown."""
    clean_h = [str(h or "").strip().replace("|", "\\|") for h in headers]
    if not any(clean_h):
        clean_h = [f"Col {i+1}" for i in range(len(headers))]

    header_line = "| " + " | ".join(clean_h) + " |"
    sep_line = "| " + " | ".join(["---"] * len(clean_h)) + " |"
    row_lines = [
        "| " + " | ".join(str(c or "").strip().replace("|", "\\|") for c in r) + " |"
        for r in rows
    ]
    return "\n".join([header_line, sep_line] + row_lines)


@dataclass
class ExtractedTable:
    table_index: int
    page_number: int
    title: str
    headers: list[str]
    rows: list[list[Any]]
    bbox: tuple[float, float, float, float]
    markdown: str


class TableChunker:
    """Extracts tables via PyMuPDF and creates parent and row-chunked children."""

    def __init__(self, max_child_rows: int = 8, max_child_chars: int = 900):
        self.max_child_rows = max_child_rows
        self.max_child_chars = max_child_chars

    def extract_tables_from_doc(self, doc: pymupdf.Document) -> list[ExtractedTable]:
        tables: list[ExtractedTable] = []
        t_count = 0

        for page_idx, page in enumerate(doc, start=1):
            try:
                table_finder = page.find_tables()
            except Exception:
                continue

            for tab in table_finder.tables:
                extracted = tab.extract()
                if not extracted:
                    continue

                t_count += 1
                headers = [str(c or "").strip() for c in extracted[0]]
                rows = extracted[1:]
                title = f"Table {t_count} (Page {page_idx})"
                md = table_to_markdown(headers, rows)

                tables.append(
                    ExtractedTable(
                        table_index=t_count,
                        page_number=page_idx,
                        title=title,
                        headers=headers,
                        rows=rows,
                        bbox=tab.bbox,
                        markdown=md,
                    )
                )

        return tables

    def chunk_tables(
        self,
        tables: list[ExtractedTable],
        document_id: int | str = 0,
        start_chunk_index: int = 0,
        start_parent_index: int = 0,
    ) -> tuple[list[GeneratedParentChunk], list[GeneratedChildChunk]]:
        parents: list[GeneratedParentChunk] = []
        children: list[GeneratedChildChunk] = []
        parent_idx = start_parent_index
        chunk_idx = start_chunk_index

        for tab in tables:
            parent_idx += 1
            parent_id = f"doc_{document_id}_p_tab_{parent_idx}"
            full_parent = f"Table: {tab.title}\nPage: {tab.page_number}\n\n{tab.markdown}"

            parents.append(
                GeneratedParentChunk(
                    parent_id=parent_id,
                    section_id=f"tab_{tab.table_index}",
                    section_title=tab.title,
                    content_type="table",
                    content=full_parent,
                    page_start=tab.page_number,
                    page_end=tab.page_number,
                    metadata={"document_id": document_id, "bbox": list(tab.bbox)},
                )
            )

            # Group rows in batches of 5-10 (self.max_child_rows) repeating header
            rows = tab.rows if tab.rows else [[]]
            for r_start in range(0, max(len(rows), 1), self.max_child_rows):
                batch_rows = rows[r_start : r_start + self.max_child_rows]
                batch_md = table_to_markdown(tab.headers, batch_rows)
                child_content = f"Table: {tab.title}\nPage: {tab.page_number}\n\n{batch_md}"

                children.append(
                    GeneratedChildChunk(
                        parent_id_str=parent_id,
                        section_id=f"tab_{tab.table_index}",
                        section_title=tab.title,
                        content_type="table",
                        content=child_content,
                        page_number=tab.page_number,
                        chunk_index=chunk_idx,
                        metadata={"document_id": document_id, "parent_id": parent_id},
                    )
                )
                chunk_idx += 1

        return parents, children
