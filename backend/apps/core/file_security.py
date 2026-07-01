import mimetypes
from pathlib import Path
from uuid import uuid4

from django.core.exceptions import ValidationError


MAX_CUSTOMER_UPLOAD_SIZE = 10 * 1024 * 1024

ALLOWED_CUSTOMER_FILE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".pdf", ".zip"}
ALLOWED_CUSTOMER_FILE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/zip",
    "application/x-zip-compressed",
}
PREVIEWABLE_CUSTOMER_FILE_TYPES = {"image/jpeg", "image/png", "image/webp", "application/pdf"}
CUSTOMER_EXTENSION_CONTENT_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
    ".zip": "application/zip",
}
CUSTOMER_ZIP_CONTENT_TYPES = {"application/zip", "application/x-zip-compressed"}


def normalize_customer_content_type(content_type, filename=""):
    content_type = (content_type or "").split(";")[0].strip().lower()
    if content_type:
        return content_type

    guessed_type, _ = mimetypes.guess_type(filename or "")
    return (guessed_type or "application/octet-stream").lower()


def get_customer_file_extension(filename):
    return Path(filename or "").suffix.lower()


def detect_customer_file_content_type(file):
    try:
        position = file.tell()
    except (AttributeError, OSError):
        position = None

    try:
        header = file.read(32)
    finally:
        try:
            file.seek(position if position is not None else 0)
        except (AttributeError, OSError):
            pass

    if header.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if header.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if len(header) >= 12 and header[:4] == b"RIFF" and header[8:12] == b"WEBP":
        return "image/webp"
    if header.startswith(b"%PDF-"):
        return "application/pdf"
    if header.startswith((b"PK\x03\x04", b"PK\x05\x06", b"PK\x07\x08")):
        return "application/zip"
    return ""


def validate_customer_upload_file(file):
    extension = get_customer_file_extension(getattr(file, "name", ""))
    content_type = normalize_customer_content_type(getattr(file, "content_type", ""), getattr(file, "name", ""))
    expected_content_type = CUSTOMER_EXTENSION_CONTENT_TYPES.get(extension)
    detected_content_type = detect_customer_file_content_type(file)

    if extension not in ALLOWED_CUSTOMER_FILE_EXTENSIONS:
        raise ValidationError("فرمت فایل مجاز نیست.")
    if content_type not in ALLOWED_CUSTOMER_FILE_TYPES:
        raise ValidationError("نوع فایل مجاز نیست.")
    if not detected_content_type or detected_content_type != expected_content_type:
        raise ValidationError("محتوای فایل با فرمت آن سازگار نیست.")
    if extension == ".zip" and content_type not in CUSTOMER_ZIP_CONTENT_TYPES:
        raise ValidationError("نوع فایل مجاز نیست.")
    if extension != ".zip" and content_type != expected_content_type:
        raise ValidationError("نوع فایل با پسوند آن سازگار نیست.")
    if file.size > MAX_CUSTOMER_UPLOAD_SIZE:
        raise ValidationError("حجم فایل نباید بیشتر از ۱۰ مگابایت باشد.")


def make_secure_customer_filename(original_name):
    extension = get_customer_file_extension(original_name)
    if extension not in ALLOWED_CUSTOMER_FILE_EXTENSIONS:
        extension = ""
    return f"{uuid4().hex}{extension}"
