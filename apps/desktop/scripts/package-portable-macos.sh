#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_NAME="Codex Pet"
if [[ "${CODEX_PET_VARIANT:-standard}" == "gyeonggi" ]]; then
  APP_NAME="Codex Pet Gyeonggi"
fi
DEFAULT_BUNDLE_DIR="$ROOT_DIR/src-tauri/target/release/bundle"
TARGET_BUNDLE_DIR="$ROOT_DIR/src-tauri/target/aarch64-apple-darwin/release/bundle"

if [[ -d "$TARGET_BUNDLE_DIR/macos/$APP_NAME.app" ]]; then
  BUNDLE_DIR="$TARGET_BUNDLE_DIR"
else
  BUNDLE_DIR="$DEFAULT_BUNDLE_DIR"
fi

APP_PATH="$BUNDLE_DIR/macos/$APP_NAME.app"
OUT_DIR="$BUNDLE_DIR/portable"
ZIP_PATH="$OUT_DIR/${APP_NAME// /-}_macos_aarch64_portable.zip"

if [[ ! -d "$APP_PATH" ]]; then
  echo "Missing app bundle: $APP_PATH" >&2
  echo "Run npm run build first." >&2
  exit 1
fi

if command -v codesign >/dev/null 2>&1; then
  SIGN_IDENTITY="${APPLE_SIGNING_IDENTITY:--}"
  echo "Signing portable app bundle with identity: $SIGN_IDENTITY"
  codesign --force --deep --sign "$SIGN_IDENTITY" "$APP_PATH"
  codesign --verify --deep --strict --verbose=2 "$APP_PATH"
else
  echo "codesign is not available; portable app will remain unsigned." >&2
fi

mkdir -p "$OUT_DIR"
rm -f "$ZIP_PATH"

ditto -c -k --sequesterRsrc --keepParent "$APP_PATH" "$ZIP_PATH"

echo "$ZIP_PATH"
