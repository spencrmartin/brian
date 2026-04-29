#!/usr/bin/env bash
#
# version.sh — Semantic versioning for Brian
#
# Single source of truth: pyproject.toml
# Syncs to: tauri.conf.json, frontend/package.json, src-tauri/Cargo.toml, brian/config.py
#
# Usage:
#   ./scripts/version.sh              # Show current version
#   ./scripts/version.sh sync         # Sync all files to pyproject.toml version
#   ./scripts/version.sh bump patch   # 0.1.0 → 0.1.1
#   ./scripts/version.sh bump minor   # 0.1.0 → 0.2.0
#   ./scripts/version.sh bump major   # 0.1.0 → 1.0.0
#   ./scripts/version.sh set 1.2.3    # Set explicit version
#   ./scripts/version.sh tag          # Create git tag for current version
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── Files to sync ────────────────────────────────────────────────────────────

PYPROJECT="$PROJECT_ROOT/pyproject.toml"
TAURI_CONF="$PROJECT_ROOT/src-tauri/tauri.conf.json"
CARGO_TOML="$PROJECT_ROOT/src-tauri/Cargo.toml"
PACKAGE_JSON="$PROJECT_ROOT/frontend/package.json"
CONFIG_PY="$PROJECT_ROOT/brian/config.py"

# ── Helpers ──────────────────────────────────────────────────────────────────

get_version() {
    grep '^version' "$PYPROJECT" | head -1 | sed 's/.*"\(.*\)".*/\1/'
}

set_version_in_file() {
    local file="$1"
    local old_ver="$2"
    local new_ver="$3"

    case "$file" in
        *.toml)
            sed -i '' "s/^version = \"$old_ver\"/version = \"$new_ver\"/" "$file"
            ;;
        *.json)
            sed -i '' "s/\"version\": \"$old_ver\"/\"version\": \"$new_ver\"/" "$file"
            ;;
        *config.py)
            sed -i '' "s/APP_VERSION = \"$old_ver\"/APP_VERSION = \"$new_ver\"/" "$file"
            ;;
    esac
}

sync_all() {
    local ver="$1"
    local old

    for file in "$PYPROJECT" "$TAURI_CONF" "$CARGO_TOML" "$PACKAGE_JSON" "$CONFIG_PY"; do
        if [[ ! -f "$file" ]]; then
            echo "  ⚠ Skipping (not found): $file"
            continue
        fi

        # Extract current version from this file
        case "$file" in
            *.toml)
                old=$(grep '^version' "$file" | head -1 | sed 's/.*"\(.*\)".*/\1/')
                ;;
            *.json)
                old=$(grep '"version"' "$file" | head -1 | sed 's/.*"\([0-9][0-9.]*\)".*/\1/')
                ;;
            *config.py)
                old=$(grep 'APP_VERSION' "$file" | head -1 | sed 's/.*"\(.*\)".*/\1/')
                ;;
        esac

        if [[ "$old" == "$ver" ]]; then
            echo "  ✓ $(basename "$file") — already $ver"
        else
            set_version_in_file "$file" "$old" "$ver"
            echo "  ✓ $(basename "$file") — $old → $ver"
        fi
    done
}

bump_version() {
    local ver="$1"
    local part="$2"

    IFS='.' read -r major minor patch <<< "$ver"

    case "$part" in
        major) major=$((major + 1)); minor=0; patch=0 ;;
        minor) minor=$((minor + 1)); patch=0 ;;
        patch) patch=$((patch + 1)) ;;
        *)
            echo "❌ Unknown bump type: $part (use major, minor, or patch)" >&2
            exit 1
            ;;
    esac

    echo "${major}.${minor}.${patch}"
}

# ── Main ─────────────────────────────────────────────────────────────────────

CURRENT=$(get_version)
ACTION="${1:-show}"

case "$ACTION" in
    show|"")
        echo "Brian v${CURRENT}"
        echo ""
        echo "Version sources:"
        for file in "$PYPROJECT" "$TAURI_CONF" "$CARGO_TOML" "$PACKAGE_JSON" "$CONFIG_PY"; do
            if [[ -f "$file" ]]; then
                case "$file" in
                    *.toml)   v=$(grep '^version' "$file" | head -1 | sed 's/.*"\(.*\)".*/\1/') ;;
                    *.json)   v=$(grep '"version"' "$file" | head -1 | sed 's/.*"\([0-9][0-9.]*\)".*/\1/') ;;
                    *config.py) v=$(grep 'APP_VERSION' "$file" | head -1 | sed 's/.*"\(.*\)".*/\1/') ;;
                esac
                if [[ "$v" == "$CURRENT" ]]; then
                    echo "  ✓ $(basename "$file"): $v"
                else
                    echo "  ✗ $(basename "$file"): $v (out of sync!)"
                fi
            fi
        done
        ;;

    sync)
        echo "Syncing all files to v${CURRENT}…"
        sync_all "$CURRENT"
        echo ""
        echo "✅ All files synced to v${CURRENT}"
        ;;

    bump)
        PART="${2:-patch}"
        NEW=$(bump_version "$CURRENT" "$PART")
        echo "Bumping version: v${CURRENT} → v${NEW} ($PART)"
        echo ""
        sync_all "$NEW"
        echo ""
        echo "✅ Version bumped to v${NEW}"
        echo ""
        echo "Next steps:"
        echo "  git add -A && git commit -m \"chore: bump version to v${NEW}\""
        echo "  git tag v${NEW}"
        echo "  git push origin spence/tauri-work --tags"
        ;;

    set)
        NEW="${2:?Usage: version.sh set <version>}"
        # Validate semver format
        if ! echo "$NEW" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
            echo "❌ Invalid version format: $NEW (expected X.Y.Z)" >&2
            exit 1
        fi
        echo "Setting version: v${CURRENT} → v${NEW}"
        echo ""
        sync_all "$NEW"
        echo ""
        echo "✅ Version set to v${NEW}"
        ;;

    tag)
        TAG="v${CURRENT}"
        echo "Creating git tag: ${TAG}"
        git -C "$PROJECT_ROOT" tag -a "$TAG" -m "Release ${TAG}"
        echo "✅ Tag ${TAG} created"
        echo ""
        echo "Push with: git push origin ${TAG}"
        ;;

    *)
        echo "Usage: version.sh [show|sync|bump <major|minor|patch>|set <X.Y.Z>|tag]"
        exit 1
        ;;
esac
