# Codex Pet 0.1.1

Release date: 2026-06-09

## Changes

- Run as a native Windows desktop app without opening a console window.
- Keep the pet available from a visible system tray icon after closing the window.
- Enlarge the pet speech bubble and window bounds so status text is not clipped.
- Replace raw resource percentage speech with softer, species-neutral status messages.
- Make pet animation speed react to CPU and memory pressure, while keeping CPU/MEM/BAT values in the resource pill.
- Add codex-pets.net compatibility for pet detail pages and download URLs that provide `pet.json` + `spritesheet.webp` ZIP packages.
- Rebuild standard and Gyeonggi Windows packages.

## Verification

- npm run typecheck
- npm run commercial:check
- npm run build:ui
- npm run smoke:preview
- cargo test
- cargo check
- npm run build
- npm run package:portable:win
- GitHub Actions Desktop Release macOS arm64 / Windows x64

## Distribution

- macOS: app, dmg, portable zip
- Windows: msi, nsis, portable zip
- Gyeonggi: separate macOS/Windows installer and portable assets
