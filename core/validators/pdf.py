"""
PDF upload validator for NovaRetail.

Validates uploaded files against four independent checks:
  1. File extension  — filename must end with .pdf
  2. File size       — must not exceed MAX_PDF_SIZE_MB megabytes
  3. Magic header    — first 5 bytes must be b'%PDF-'
  4. MIME type       — when declared by the browser, must be application/pdf
                       (used as a supplementary signal, never the sole check)

Usage in a model field:
    from core.validators.pdf import validate_pdf
    file = models.FileField(upload_to="documents/", validators=[validate_pdf])
"""

import os

from django.core.exceptions import ValidationError


# ---------------------------------------------------------------------------
# Configuration constants
# ---------------------------------------------------------------------------

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
    """
    Validate that *file* is a legitimate PDF upload.

    Compatible with Django's ``InMemoryUploadedFile`` and
    ``TemporaryUploadedFile`` (both are ``UploadedFile`` subclasses), as well
    as any file-like object that exposes ``.name``, ``.size`` or ``len()``,
    ``.read()``, and ``.seek()``.

    Raises:
        django.core.exceptions.ValidationError: on any failed check.
    """
    _check_extension(file)
    _check_size(file)
    _check_magic_header(file)
    _check_mime_type(file)


# ---------------------------------------------------------------------------
# Individual check helpers (private)
# ---------------------------------------------------------------------------

def _check_extension(file) -> None:
    """
    Reject files whose name does not end with .pdf.

    ``os.path.splitext`` handles edge-cases like missing extensions,
    names like `.pdf`, and upper-case suffixes (we normalise to lower-case).
    """
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
    """
    Confirm the binary magic bytes at the start of the file are ``%PDF-``.

    Why: a user can rename any file (e.g. malware.exe) to document.pdf.
    The extension check catches innocent mistakes; the magic header check
    catches deliberate spoofing.

    After reading, the file pointer is **always reset to 0** so Django's
    storage backend can read the full file when it saves it.
    """
    try:
        # Seek to the beginning in case the pointer has been moved already.
        file.seek(0)
        header: bytes = file.read(PDF_MAGIC_HEADER_LENGTH)
    except (AttributeError, OSError) as exc:
        raise ValidationError(
            "Could not read the uploaded file to verify it is a valid PDF."
        ) from exc
    finally:
        # Always restore the pointer, even if read() raised.
        try:
            file.seek(0)
        except (AttributeError, OSError):
            pass  # Best-effort restore; Django will raise its own error if needed.

    if header != PDF_MAGIC_HEADER:
        # Show a sanitised hex representation — never echo raw bytes into an
        # error message, as they may contain control characters.
        received_hex = header.hex() if header else "(empty)"
        raise ValidationError(
            "The uploaded file does not appear to be a valid PDF. "
            f"Expected magic header '{PDF_MAGIC_HEADER.decode()}', "
            f"got bytes: 0x{received_hex}."
        )


def _check_mime_type(file) -> None:
    """
    Check the browser-declared MIME type as a supplementary signal.

    Django stores the client-supplied Content-Type in
    ``UploadedFile.content_type``. This value is **supplied by the client**
    and must never be trusted alone — a malicious actor can send any string
    here. It is checked last, after the magic header already confirmed the
    binary content, so it acts as an additional soft filter rather than a
    security gate.

    If the attribute is absent (plain file-like objects, tests), the check
    is silently skipped.
    """
    mime_type: str | None = getattr(file, "content_type", None)

    if mime_type is None:
        return  # Not an UploadedFile — skip gracefully.

    # Normalise: strip parameters such as "; charset=binary".
    normalised_mime = mime_type.split(";")[0].strip().lower()

    if normalised_mime and normalised_mime not in ALLOWED_MIME_TYPES:
        raise ValidationError(
            f"Invalid MIME type '{normalised_mime}'. "
            "PDF files must be uploaded as 'application/pdf'."
        )

