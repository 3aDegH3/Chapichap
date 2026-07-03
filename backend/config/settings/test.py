from .base import *


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
ENABLE_MOCK_PAYMENTS = True
SECRET_KEY = "test-only-secret-key-with-more-than-fifty-characters-1234567890"
