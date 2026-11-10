"""
PDF text extraction and chunking utilities.

Usage:
    from core.pdf_utils import extract_pdf_pages, chunk_text

    pages = extract_pdf_pages("/path/to/document.pdf")
    # [{"page_number": 1, "text": "..."}, {"page_number": 3, "text": "..."}, ...]

    chunks = chunk_text("some long text...", chunk_size=1000, overlap=150)
    # ["chunk 1...", "chunk 2...", ...]
"""

import pymupdf


def extract_pdf_pages(file_path: str) -> list[dict]:
    """
    Extract text from every page of a PDF file.

    Args:
        file_path: Absolute or relative path to the PDF file.

    Returns:
        A list of dicts with ``page_number`` (1-based) and ``text`` keys.
        Pages that contain only whitespace are skipped.
    """
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

    chunks = []
    start = 0
    step = chunk_size - overlap

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        if end >= len(text):
            break
        start += step

    return chunks

