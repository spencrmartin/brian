#!/usr/bin/env bash
#
# build-backend.sh
# Build the brian-backend Python sidecar for Tauri.
#
# Usage:
#   ./scripts/build-backend.sh          # Build and copy to src-tauri/binaries/
#   ./scripts/build-backend.sh --clean  # Clean previous build artifacts first
#
set -euo pipefail

# ─── Configuration ───────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SPEC_FILE="$PROJECT_ROOT/brian-backend.spec"
VENV_DIR="$PROJECT_ROOT/venv"
DIST_DIR="$PROJECT_ROOT/dist"
BUILD_DIR="$PROJECT_ROOT/build"
TAURI_BIN_DIR="$PROJECT_ROOT/src-tauri/binaries"
BINARY_NAME="brian-backend"

# ─── Determine platform triple ──────────────────────────────────────────────

detect_platform_triple() {
    local os arch triple

    os="$(uname -s)"
    arch="$(uname -m)"

    case "$os" in
        Darwin)
            case "$arch" in
                arm64)  triple="aarch64-apple-darwin" ;;
                x86_64) triple="x86_64-apple-darwin" ;;
                *)      echo "❌ Unsupported macOS architecture: $arch" >&2; exit 1 ;;
            esac
            ;;
        Linux)
            case "$arch" in
                x86_64)  triple="x86_64-unknown-linux-gnu" ;;
                aarch64) triple="aarch64-unknown-linux-gnu" ;;
                armv7l)  triple="armv7-unknown-linux-gnueabihf" ;;
                *)       echo "❌ Unsupported Linux architecture: $arch" >&2; exit 1 ;;
            esac
            ;;
        MINGW*|MSYS*|CYGWIN*|Windows_NT)
            case "$arch" in
                x86_64|AMD64) triple="x86_64-pc-windows-msvc" ;;
                aarch64)      triple="aarch64-pc-windows-msvc" ;;
                *)            echo "❌ Unsupported Windows architecture: $arch" >&2; exit 1 ;;
            esac
            ;;
        *)
            echo "❌ Unsupported OS: $os" >&2
            exit 1
            ;;
    esac

    echo "$triple"
}

PLATFORM_TRIPLE="$(detect_platform_triple)"
SIDECAR_NAME="${BINARY_NAME}-${PLATFORM_TRIPLE}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🧠 brian-backend build"
echo "  Platform: $PLATFORM_TRIPLE"
echo "  Project:  $PROJECT_ROOT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ─── Handle --clean flag ─────────────────────────────────────────────────────

if [[ "${1:-}" == "--clean" ]]; then
    echo ""
    echo "🧹 Cleaning previous build artifacts..."
    rm -rf "$DIST_DIR/$BINARY_NAME" "$BUILD_DIR/$BINARY_NAME"
    echo "   Done."
fi

# ─── Activate virtual environment ────────────────────────────────────────────

echo ""
echo "🐍 Activating virtual environment..."

if [[ ! -d "$VENV_DIR" ]]; then
    echo "❌ Virtual environment not found at: $VENV_DIR" >&2
    echo "   Run 'python3 -m venv venv && pip install -r requirements.txt' first." >&2
    exit 1
fi

# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"
echo "   Python: $(python --version) ($(which python))"

# ─── Ensure PyInstaller is installed ─────────────────────────────────────────

if ! command -v pyinstaller &>/dev/null; then
    echo ""
    echo "📦 Installing PyInstaller..."
    pip install --quiet pyinstaller
fi
echo "   PyInstaller: $(pyinstaller --version)"

# ─── Verify spec file exists ────────────────────────────────────────────────

if [[ ! -f "$SPEC_FILE" ]]; then
    echo "❌ Spec file not found: $SPEC_FILE" >&2
    exit 1
fi

# ─── Run PyInstaller ────────────────────────────────────────────────────────

echo ""
echo "🔨 Building with PyInstaller (--onedir mode)..."
echo "   Spec: $SPEC_FILE"
echo ""

pyinstaller \
    --noconfirm \
    --distpath "$DIST_DIR" \
    --workpath "$BUILD_DIR" \
    "$SPEC_FILE"

# ─── Verify the build output ────────────────────────────────────────────────

# --onefile mode: binary is directly in dist/
BUILT_BINARY="$DIST_DIR/$BINARY_NAME"

if [[ ! -f "$BUILT_BINARY" ]]; then
    echo "" >&2
    echo "❌ Build failed — binary not found at: $BUILT_BINARY" >&2
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo "   Binary: $BUILT_BINARY"
echo "   Size:   $(du -sh "$BUILT_BINARY" | cut -f1)"

# ─── Copy to Tauri sidecar location ─────────────────────────────────────────

echo ""
echo "📁 Copying to Tauri sidecar directory..."

mkdir -p "$TAURI_BIN_DIR"

# --onefile mode: single binary with platform triple name
# Clean up any old --onedir artifacts
rm -rf "$TAURI_BIN_DIR/$BINARY_NAME"
rm -f "$TAURI_BIN_DIR/$SIDECAR_NAME"

cp "$BUILT_BINARY" "$TAURI_BIN_DIR/$SIDECAR_NAME"
chmod +x "$TAURI_BIN_DIR/$SIDECAR_NAME"

echo "   Sidecar: $TAURI_BIN_DIR/$SIDECAR_NAME"

# ─── Summary ────────────────────────────────────────────────────────────────

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ brian-backend sidecar ready!"
echo ""
echo "  Binary:   $SIDECAR_NAME"
echo "  Location: $TAURI_BIN_DIR/$SIDECAR_NAME"
echo ""
echo "  To test:  $TAURI_BIN_DIR/$SIDECAR_NAME"
echo "  Health:   curl http://127.0.0.1:8080/health"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
