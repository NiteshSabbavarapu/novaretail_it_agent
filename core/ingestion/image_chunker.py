"""Simple image extraction with PyMuPDF and optional Vision description."""

from __future__ import annotations

import base64
import os
from dataclasses import dataclass
from typing import Any
import pymupdf

from core.ingestion.text_chunker import GeneratedParentChunk, GeneratedChildChunk


@dataclass
class ExtractedImage:
    image_index: int
    page_number: int
    xref: int
    bbox: tuple[float, float, float, float]
    width: int
    height: int
    extension: str
    image_bytes: bytes
    surrounding_context: str
    description: str = ""


class ImageChunker:
    """Extracts images and creates parent and child chunks with vision/context descriptions."""

    def __init__(
        self,
        enable_vision: bool | None = None,
        vision_model: str | None = None,
        groq_client: Any = None,
    ):
        if enable_vision is not None:
            self.enable_vision = enable_vision
        else:
            self.enable_vision = os.getenv("ENABLE_VISION_PROCESSING", "true").lower() in ("1", "true", "yes")

        self.vision_model = vision_model or os.getenv("GROQ_VISION_MODEL", "llama-3.2-11b-vision-preview")
        self._groq_client = groq_client

    def _get_client(self):
        if self._groq_client is None:
            api_key = os.getenv("GROQ_API_KEY")
            if api_key:
                try:
                    from groq import Groq
                    self._groq_client = Groq(api_key=api_key)
                except Exception:
                    pass
        return self._groq_client

    def describe_image_with_vision(
        self,
        image_bytes: bytes,
        extension: str,
        surrounding_context: str = "",
    ) -> str:
        """Generates vision description, or falls back to context without claiming vision."""
        if self.enable_vision:
            client = self._get_client()
            if client:
                try:
                    b64 = base64.b64encode(image_bytes).decode("utf-8")
                    mime = "image/jpeg" if extension.lower() in ("jpg", "jpeg") else "image/png"
                    prompt = "Describe this technical diagram concisely and factually."
                    if surrounding_context:
                        prompt += f" Context: {surrounding_context}"

                    resp = client.chat.completions.create(
                        model=self.vision_model,
                        messages=[
                            {
                                "role": "user",
                                "content": [
                                    {"type": "text", "text": prompt},
                                    {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}},
                                ],
                            }
                        ],
                        max_tokens=300,
                    )
                    content = resp.choices[0].message.content
                    if content and content.strip():
                        return content.strip()
                except Exception:
                    pass

        # Fallback without claiming visual understanding
        if surrounding_context.strip():
            return f"Diagram / Figure. Nearby context: {surrounding_context.strip()}"
        return "Diagram / Figure illustrating technical system components."

    def extract_images_from_doc(self, doc: pymupdf.Document) -> list[ExtractedImage]:
        extracted: list[ExtractedImage] = []
        img_count = 0

        for page_idx, page in enumerate(doc, start=1):
            for img_info in page.get_images(full=True):
                xref = img_info[0]
                base_img = doc.extract_image(xref)
                if not base_img or base_img.get("width", 0) <= 2:
                    continue

                img_count += 1
                w, h = base_img["width"], base_img["height"]
                rects = page.get_image_rects(xref)
                bbox = tuple(rects[0]) if rects else (0.0, 0.0, float(w), float(h))

                # Capture nearby text within vertical distance of 75pt of image top/bottom
                blocks = page.get_text("blocks")
                nearby = [
                    b[4].strip()
                    for b in blocks
                    if len(b) >= 5
                    and (abs(b[1] - bbox[3]) < 75 or abs(bbox[1] - b[3]) < 75 or abs(b[1] - bbox[1]) < 75)
                    and b[4].strip()
                ]
                context = " ".join(nearby)

                desc = self.describe_image_with_vision(base_img["image"], base_img["ext"], context)

                extracted.append(
                    ExtractedImage(
                        image_index=img_count,
                        page_number=page_idx,
                        xref=xref,
                        bbox=bbox,
                        width=w,
                        height=h,
                        extension=base_img["ext"],
                        image_bytes=base_img["image"],
                        surrounding_context=context,
                        description=desc,
                    )
                )

        return extracted

    def chunk_images(
        self,
        images: list[ExtractedImage],
        document_id: int | str = 0,
        start_chunk_index: int = 0,
        start_parent_index: int = 0,
    ) -> tuple[list[GeneratedParentChunk], list[GeneratedChildChunk]]:
        parents: list[GeneratedParentChunk] = []
        children: list[GeneratedChildChunk] = []
        parent_idx = start_parent_index
        chunk_idx = start_chunk_index

        for img in images:
            parent_idx += 1
            parent_id = f"doc_{document_id}_p_img_{parent_idx}"
            title = f"Figure {img.image_index} (Page {img.page_number})"
            content = f"Image: {title}\nPage: {img.page_number}\nDimensions: {img.width}x{img.height}\nDescription: {img.description}"
            if img.surrounding_context:
                content += f"\nContext: {img.surrounding_context}"

            parents.append(
                GeneratedParentChunk(
                    parent_id=parent_id,
                    section_id=f"img_{img.image_index}",
                    section_title=title,
                    content_type="image",
                    content=content,
                    page_start=img.page_number,
                    page_end=img.page_number,
                    metadata={"document_id": document_id, "bbox": list(img.bbox)},
                )
            )

            children.append(
                GeneratedChildChunk(
                    parent_id_str=parent_id,
                    section_id=f"img_{img.image_index}",
                    section_title=title,
                    content_type="image",
                    content=content,
                    page_number=img.page_number,
                    chunk_index=chunk_idx,
                    metadata={"document_id": document_id, "parent_id": parent_id},
                )
            )
            chunk_idx += 1

        return parents, children
