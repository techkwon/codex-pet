# Codex Pet 0.1.0

Release date: 2026-06-08

## Changes

- Split the standalone app into `techkwon/codex-pet`.
- Keep `techkwon/codex-characters` as the character asset source.
- Publish standard macOS/Windows packages from GitHub Releases.
- Add Gyeonggi builds with `Airo` as the default pet and the HighLearning shortcut.
- Keep the pet as a standalone desktop window with settings opened from the character.
- Add background execution, system tray/menu bar controls, and OS login autostart setting.
- Keep Codex pet compatibility for local folders, GitHub folder URLs, `pet.json` URLs, and ZIP URLs.
- Include `Calico`, `Max`, `Haro`, and `Airo` as selectable built-in pets.

## Verification

- npm run typecheck
- npm run build:ui
- VITE_CODEX_PET_VARIANT=gyeonggi npm run build:ui
- npm run commercial:check
- cargo check
- npm run build
- npm run package:portable:mac
- GitHub Actions Desktop Build standard/Gyeonggi macOS arm64 / Windows x64

## Distribution

- macOS: app, dmg, portable zip
- Windows: msi, nsis, portable zip
- Gyeonggi: separate macOS/Windows installer and portable assets
