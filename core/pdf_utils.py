"""PDF utilities for NovaRetail.

Provides backward-compatible helper functions delegating to recursive and layout-aware splitters.
"""

import pymupdf
from langchain_text_splitters import RecursiveCharacterTextSplitter


def extract_pdf_pages(file_path: str) -> list[dict]:
    """Extracts text and page numbers from a PDF document."""
    doc = pymupdf.open(file_path)
    try:
        pages = []
        for i, page in enumerate(doc, start=1):
            text = page.get_text()
            if text.strip():
                pages.append({"page_number": i, "text": text})
        return pages
    finally:
        doc.close()


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 150) -> list[str]:
    """Chunks text using recursive character splitting across natural boundaries."""
    if chunk_size <= 0:
        raise ValueError(f"chunk_size must be > 0, got {chunk_size}")
    if overlap < 0:
        raise ValueError(f"overlap must be >= 0, got {overlap}")
    if overlap >= chunk_size:
        raise ValueError(
            f"overlap ({overlap}) must be less than chunk_size ({chunk_size})"
        )

    if not text or not text.strip():
        return []

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
        keep_separator=True,
    )
    return splitter.split_text(text)
