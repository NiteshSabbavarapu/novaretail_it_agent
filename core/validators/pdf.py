import os

from django.core.exceptions import ValidationError

MAX_PDF_SIZE_MB: int = 20
MAX_PDF_SIZE_BYTES: int = MAX_PDF_SIZE_MB * 1024 * 1024

PDF_MAGIC_HEADER: bytes = b"%PDF-"
PDF_MAGIC_HEADER_LENGTH: int = len(PDF_MAGIC_HEADER)  # 5 bytes

ALLOWED_EXTENSIONS: frozenset[str] = frozenset({".pdf"})
ALLOWED_MIME_TYPES: frozenset[str] = frozenset({"application/pdf"})


# ---------------------------------------------------------------------------
# Public validator
# ---------------------------------------------------------------------------

def validate_pdf(file) -> None:
    _check_extension(file)
    _check_size(file)
    _check_magic_header(file)
    _check_mime_type(file)

def _check_extension(file) -> None:
    name: str = getattr(file, "name", "") or ""
    _, ext = os.path.splitext(name)

    if ext.lower() not in ALLOWED_EXTENSIONS:
        raise ValidationError(
            "Only PDF files are accepted. "
            f"Received file with extension '{ext or '(none)'}'."
        )

def _check_size(file) -> None:
    size = getattr(file, "size", None)

    if size is None:
        try:
            current_position = file.tell()
            file.seek(0, os.SEEK_END)
            size = file.tell()
            file.seek(current_position)
        except (AttributeError, OSError):
            raise ValidationError(
                "Unable to determine uploaded file size."
            )

    if size > MAX_PDF_SIZE_BYTES:
        raise ValidationError(
            f"PDF file size must not exceed {MAX_PDF_SIZE_MB} MB."
        )


def _check_magic_header(file) -> None:
    try:
        file.seek(0)
        header: bytes = file.read(PDF_MAGIC_HEADER_LENGTH)
    except (AttributeError, OSError) as exc:
        raise ValidationError(
            "Could not read the uploaded file to verify it is a valid PDF."
        ) from exc
    finally:
        try:
            file.seek(0)
        except (AttributeError, OSError):
            pass

    if header != PDF_MAGIC_HEADER:
        received_hex = header.hex() if header else "(empty)"
        raise ValidationError(
            "The uploaded file does not appear to be a valid PDF. "
            f"Expected magic header '{PDF_MAGIC_HEADER.decode()}', "
            f"got bytes: 0x{received_hex}."
        )


def _check_mime_type(file) -> None:
    mime_type: str | None = getattr(file, "content_type", None)

    if mime_type is None:
        return

    normalised_mime = mime_type.split(";")[0].strip().lower()

    if normalised_mime and normalised_mime not in ALLOWED_MIME_TYPES:
        raise ValidationError(
            f"Invalid MIME type '{normalised_mime}'. "
            "PDF files must be uploaded as 'application/pdf'."
        )

