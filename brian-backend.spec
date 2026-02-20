# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec file for brian-backend
Bundles the FastAPI/uvicorn Python backend as a standalone executable
for use as a Tauri sidecar.

Usage:
    pyinstaller brian-backend.spec
"""

import sys
from pathlib import Path

block_cipher = None

# Project root (where this spec file lives)
PROJECT_ROOT = Path(SPECPATH)

# ─── Analysis ────────────────────────────────────────────────────────────────

a = Analysis(
    # Entry point wrapper (avoids relative import issues)
    [str(PROJECT_ROOT / 'brian-backend-entry.py')],
    pathex=[str(PROJECT_ROOT)],
    binaries=[],

    # Data files: (source, destination_in_bundle)
    datas=[
        # Static assets
        (str(PROJECT_ROOT / 'brian' / 'static' / 'css'), 'brian/static/css'),
        (str(PROJECT_ROOT / 'brian' / 'static' / 'js'), 'brian/static/js'),
        # HTML templates
        (str(PROJECT_ROOT / 'brian' / 'templates'), 'brian/templates'),
        # MCP app views
        (str(PROJECT_ROOT / 'brian_mcp' / 'mcp-app-views'), 'brian_mcp/mcp-app-views'),
    ],

    # Hidden imports that PyInstaller cannot detect automatically
    hiddenimports=[
        # ── FastAPI / Starlette ──
        'fastapi',
        'fastapi.applications',
        'fastapi.routing',
        'fastapi.middleware',
        'fastapi.middleware.cors',
        'fastapi.staticfiles',
        'fastapi.responses',
        'fastapi.encoders',
        'fastapi.exceptions',
        'fastapi.params',
        'fastapi.dependencies',
        'fastapi.security',
        'starlette',
        'starlette.applications',
        'starlette.routing',
        'starlette.middleware',
        'starlette.middleware.cors',
        'starlette.staticfiles',
        'starlette.responses',
        'starlette.requests',
        'starlette.exceptions',
        'starlette.status',
        'starlette.concurrency',
        'starlette.formparsers',
        'starlette.templating',
        'starlette.background',
        'starlette.datastructures',
        'starlette.convertors',

        # ── Uvicorn ──
        'uvicorn',
        'uvicorn.config',
        'uvicorn.main',
        'uvicorn.server',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        'uvicorn.lifespan.off',
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.loops.uvloop',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.http.h11_impl',
        'uvicorn.protocols.http.httptools_impl',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.protocols.websockets.websockets_impl',
        'uvicorn.protocols.websockets.wsproto_impl',

        # ── Uvicorn optional speedups ──
        'uvloop',
        'httptools',
        'httptools.parser',
        'httptools.parser.parser',
        'websockets',
        'websockets.legacy',
        'websockets.legacy.server',

        # ── Pydantic ──
        'pydantic',
        'pydantic.main',
        'pydantic.fields',
        'pydantic.types',
        'pydantic.validators',
        'pydantic.error_wrappers',
        'pydantic.json',
        'pydantic.networks',
        'pydantic.datetime_parse',
        'pydantic.functional_validators',
        'pydantic.functional_serializers',
        'pydantic._internal',
        'pydantic._internal._config',
        'pydantic._internal._core_utils',
        'pydantic._internal._decorators',
        'pydantic._internal._fields',
        'pydantic._internal._generate_schema',
        'pydantic._internal._generics',
        'pydantic._internal._model_construction',
        'pydantic._internal._repr',
        'pydantic._internal._typing_extra',
        'pydantic._internal._utils',
        'pydantic._internal._validators',
        'pydantic_core',
        'pydantic_core._pydantic_core',

        # ── MCP ──
        'mcp',
        'mcp.server',
        'mcp.client',
        'mcp.types',

        # ── HTTP clients ──
        'httpx',
        'httpx._transports',
        'httpx._transports.default',
        'httpx_sse',

        # ── SSE / multipart ──
        'sse_starlette',
        'sse_starlette.sse',
        'multipart',
        'multipart.multipart',

        # ── Web scraping / parsing ──
        'bs4',
        'bs4.builder',
        'bs4.builder._htmlparser',
        'requests',
        'requests.adapters',
        'urllib3',

        # ── Standard library modules sometimes missed ──
        'sqlite3',
        'pathlib',
        'json',
        'logging',
        'logging.config',
        'email',
        'email.mime',
        'email.mime.text',
        'email.mime.multipart',

        # ── Other dependencies ──
        'yaml',
        'click',
        'jsonschema',
        'jsonschema.validators',
        'jsonschema._format',
        'annotated_types',
        'anyio',
        'anyio._backends',
        'anyio._backends._asyncio',
        'sniffio',
        'h11',
        'idna',
        'certifi',
        'charset_normalizer',
        'typing_extensions',

        # ── Brian packages ──
        'brian',
        'brian.main',
        'brian.config',
        'brian.api',
        'brian.api.routes',
        'brian.database',
        'brian.database.connection',
        'brian.database.migrations',
        'brian.database.repository',
        'brian.database.schema',
        'brian.models',
        'brian.models.knowledge_item',
        'brian.services',
        'brian.services.clustering',
        'brian.services.link_preview',
        'brian.services.similarity',
        'brian.skills',
        'brian.skills.cli',
        'brian.skills.importer',
        'brian_mcp',
        'brian_mcp.server',
    ],

    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        # Exclude unnecessary heavy modules
        'tkinter',
        'matplotlib',
        'numpy',
        'scipy',
        'pandas',
        'PIL',
        'PyQt5',
        'PyQt6',
        'PySide2',
        'PySide6',
        'wx',
        'test',
        'unittest',
        'distutils',
        'setuptools',
        'pip',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

# ─── PYZ (Python bytecode archive) ──────────────────────────────────────────

pyz = PYZ(
    a.pure,
    a.zipped_data,
    cipher=block_cipher,
)

# ─── EXE (--onefile mode for Tauri sidecar compatibility) ────────────────────

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='brian-backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=True,             # Strip debug symbols for smaller size
    upx=True,               # Compress with UPX if available
    console=True,           # Sidecar needs console for stdout/stderr
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,       # Build for current architecture
    codesign_identity=None,
    entitlements_file=None,
)
