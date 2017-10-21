import os
import tempfile


DEBUG = os.environ.get('DEBUG', '').lower() in ('true', '1')
TEMP_DIR = tempfile.gettempdir()

EXAJLOAD_BIN = os.environ.get('EXAJLOAD_BIN', '/usr/local/bin/exajload')

EXASOL_HOST = os.environ.get('EXASOL_HOST', 'localhost:8563')
EXASOL_USER = os.environ.get('EXASOL_USER', 'sys')
EXASOL_PASSWORD = os.environ.get('EXASOL_PASSWORD', 'exasol')

EXAQUERY_HOST = os.environ.get('EXAQUERY_HOST', '0.0.0.0')
EXAQUERY_PORT = int(os.environ.get('EXAQUERY_PORT', 50020))
