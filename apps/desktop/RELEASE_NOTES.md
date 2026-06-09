# Codex Pet 0.1.3

Release date: 2026-06-09

## Changes

- Ad-hoc sign macOS portable `.app` bundles before creating ZIP packages.
- Verify the macOS app bundle signature during portable packaging.
- Keep unsigned/test distribution available while reducing macOS "damaged app" Gatekeeper failures.
- Add a commercial readiness gate so future macOS portable packages keep the signing step.

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
