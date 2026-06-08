# Codex Pet

Codex Pet은 Codex 없이 단독 실행되는 초경량 데스크탑 펫 앱입니다. 캐릭터가 화면 오른쪽 하단에 단독으로 떠 있고, 캐릭터를 클릭하면 설정과 바로가기 메뉴가 열립니다.

## 다운로드

최신 실행 파일은 GitHub Releases에서 받습니다.

- 최신 릴리스: https://github.com/techkwon/codex-pet/releases/latest
- Windows 표준: `Codex Pet_0.1.0_x64-setup.exe`, `Codex Pet_0.1.0_x64_en-US.msi`, `Codex-Pet_windows_x64_portable.zip`
- macOS 표준: `Codex Pet_0.1.0_aarch64.dmg`, `Codex-Pet_macos_aarch64_portable.zip`
- Windows 경기 빌드: `Codex Pet Gyeonggi_0.1.0_x64-setup.exe`, `Codex Pet Gyeonggi_0.1.0_x64_en-US.msi`, `Codex-Pet-Gyeonggi_windows_x64_portable.zip`
- macOS 경기 빌드: `Codex Pet Gyeonggi_0.1.0_aarch64.dmg`, `Codex-Pet-Gyeonggi_macos_aarch64_portable.zip`

Portable ZIP은 설치 없이 압축을 풀고 실행할 수 있습니다. 첫 테스트 배포는 Store 등록 없이 GitHub Release와 portable 패키지를 기준으로 합니다.

## 빌드 종류

- 표준 빌드: 기본 펫은 `Calico`입니다. `Max`, `Haro`, `Airo`를 선택할 수 있습니다.
- 경기 빌드: 기본 펫은 `Airo`입니다. 기본 바로가기에 하이러닝 사이트 `https://hi.goe.go.kr/`가 들어갑니다.

## 주요 기능

- 백그라운드 실행: 설정 창을 닫아도 앱은 종료되지 않고 시스템 트레이/메뉴바에 상주합니다.
- 시스템 트레이/메뉴바: 설정 열기, 오늘 루틴, 집중 시작, 펫 보이기, 펫 숨기기, 종료를 실행합니다.
- OS 시작 시 자동 실행: 설정에서 켜고 끌 수 있습니다.
- Codex 펫 호환: `pet.json + spritesheet.webp` 구조의 Codex 펫을 그대로 가져올 수 있습니다.
- 웹 펫 추가: 로컬 폴더, GitHub 폴더 URL, ZIP URL에서 펫을 내려받아 검증 후 설치합니다.
- 캐릭터 바로가기: 스크린샷, 계산기, 메모장, 날씨가 기본 제공되고 사용자가 URL/파일 경로 바로가기를 추가할 수 있습니다.
- 리소스 반응: CPU, 메모리, 배터리 상태에 따라 캐릭터 상태와 애니메이션 속도가 달라집니다.

## 사용 방법

1. GitHub Release에서 OS에 맞는 패키지를 다운로드합니다.
2. Portable ZIP은 압축을 풀고 실행합니다. 설치형은 `.exe`, `.msi`, `.dmg`를 실행합니다.
3. 앱을 실행하면 펫이 화면 오른쪽 하단에 뜹니다.
4. 펫을 클릭하면 바로가기와 설정 메뉴가 열립니다.
5. 설정에서 `OS 시작 시 자동 실행`, `펫 창 표시`, 리소스 반응, 캐릭터 크기, 캐릭터 아래 표시 정보를 조정합니다.
6. 트레이/메뉴바 아이콘에서 설정을 다시 열거나 펫을 숨기고, 완전히 종료할 수 있습니다.

## 캐릭터 자산

기본 캐릭터 자산은 별도 저장소에 둡니다.

- 캐릭터 저장소: https://github.com/techkwon/codex-characters
- 기본 자산 경로: `highlearning/calico`, `highlearning/max`, `highlearning/haro`, `highlearning/airo`

## 개발

```bash
cd apps/desktop
npm ci
npm run typecheck
npm run build:ui
cd src-tauri && cargo check
```

경기 빌드 UI 확인:

```bash
cd apps/desktop
VITE_CODEX_PET_VARIANT=gyeonggi npm run build:ui
```

상업 배포 점검:

```bash
cd apps/desktop
npm run release:check
npm run signing:check
npm run commercial:check
npm run smoke:preview
```

## 배포

`desktop-vX.Y.Z` 태그를 푸시하면 GitHub Actions가 macOS arm64, Windows x64, 경기 빌드까지 모두 빌드하고 GitHub Release에 업로드합니다.

```bash
git tag desktop-v0.1.0
git push origin desktop-v0.1.0
```

Mac App Store 등록은 현재 범위에서 제외합니다.
