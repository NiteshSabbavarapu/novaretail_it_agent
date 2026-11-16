import re

from dataclasses import dataclass


@dataclass
class DetectedSection:
    section_id: str
    title: str
    level: int
    page_start: int
    page_end: int
    content: str


NUMBERED_HEADING = re.compile(
    r"^(chapter|section|part)\s+[\w.-]+|^\d+(\.\d+)*\.?\s+|^[A-Z]\.\d+\s+",
    re.IGNORECASE
)


class DocumentLayoutAnalyzer:

    def __init__(self, doc):
        self.doc = doc

    def is_heading(self, text, spans):
        if not text or len(text) > 120:
            return False, 0

        font_size = max(
            (span["size"] for span in spans),
            default=10
        )

        is_bold = any(
            "bold" in span["font"].lower()
            for span in spans
        )

        is_numbered = bool(NUMBERED_HEADING.match(text))

        if font_size >= 13 or is_bold or is_numbered:
            if is_numbered and "." in text.split()[0]:
                level = text.split()[0].count(".") + 1
            else:
                level = 1 if font_size >= 15 else 2

            return True, level

        return False, 0

    def extract_sections(self):
        sections = []

        title = "Document Overview"
        content = []
        start_page = 1
        end_page = 1
        level = 1

        def save_section():
            if not content:
                return

            sections.append(
                DetectedSection(
                    section_id=f"sec_{len(sections) + 1}",
                    title=title,
                    level=level,
                    page_start=start_page,
                    page_end=end_page,
                    content="\n".join(content).strip()
                )
            )

        for page_number, page in enumerate(self.doc, start=1):
            data = page.get_text("dict")

            for block in data["blocks"]:
                if block["type"] != 0:
                    continue

                for line in block["lines"]:
                    spans = line["spans"]

                    text = "".join(
                        span["text"] for span in spans
                    ).strip()

                    if not text:
                        continue

                    is_heading, heading_level = self.is_heading(
                        text, spans
                    )

                    if is_heading:
                        save_section()

                        title = text
                        content = []
                        start_page = page_number
                        end_page = page_number
                        level = heading_level

                    else:
                        content.append(text)
                        end_page = page_number

        save_section()

        if not sections:
            full_text = "\n\n".join(
                page.get_text() for page in self.doc
            ).strip()

            if full_text:
                sections.append(
                    DetectedSection(
                        section_id="sec_1",
                        title="Document Overview",
                        level=1,
                        page_start=1,
                        page_end=len(self.doc),
                        content=full_text
                    )
                )

        return sections
