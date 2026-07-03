import os

from .base import *

DEBUG = True
ENABLE_MOCK_PAYMENTS = os.environ.get("ENABLE_MOCK_PAYMENTS", "true").lower() == "true"
