# Codex Pet 0.1.2

Release date: 2026-06-09

## Changes

- Fix clipped pet speech bubbles on macOS by widening the default standalone pet window.
- Center the pet speech bubble and resource pill so text stays inside the transparent window bounds.
- Allow CPU/MEM/BAT resource text to wrap instead of showing a broken ellipsis.
- Keep the existing compact pet size while giving status text enough room to render cleanly.

## Verification

- npm run typecheck
- npm run commercial:check
- npm run build:ui
- npm run smoke:preview
- cargo check
- cargo test
- npm run build
- npm run package:portable:mac
- GitHub Actions Desktop Release macOS arm64 / Windows x64

## Distribution

- macOS: app, dmg, portable zip
- Windows: msi, nsis, portable zip
- Gyeonggi: separate macOS/Windows installer and portable assets
