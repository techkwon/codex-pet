# Codex Pet Release Checklist

상업 배포 전에 매번 확인할 항목입니다.

## 1. 빌드 검증

```bash
npm run typecheck
npm run release:check
npm run signing:check
npm run commercial:check
npm run build:ui
npm run smoke:preview
cd src-tauri && cargo check
cd ..
npm run build
npm run package:portable:mac
```

Windows runner:

```powershell
npm run typecheck
npm run release:check
npm run signing:check
npm run commercial:check
npm run build:ui
npm run smoke:preview
cd src-tauri
cargo check
cd ..
npm run build
npm run package:portable:win
```

통과 기준:

- TypeScript 오류 없음
- `package.json`, `package-lock.json`, `Cargo.toml`, `tauri.conf.json` 버전 일치
- signing readiness 출력에서 unsigned build 상태와 누락 secret을 확인
- commercial readiness가 CSP, asset protocol, 내장 펫, workflow action/runtime, runner label을 통과
- preview smoke가 정적 shell, JS/CSS bundle, 내장 펫 manifest/spritesheet, 핵심 UI 문구를 통과
- Rust `cargo check` 오류 없음
- macOS `.app`, `.dmg`, portable `.zip` 생성
- Windows `msi`, `nsis`, portable `.zip` 생성
- GitHub Actions `Desktop Build` workflow에서 표준/경기 macOS arm64와 표준/경기 Windows x64 artifact 업로드
- 앱 실행 후 첫 화면에서 `Calico`, `Max`, `Haro`, `Airo`가 선택 가능
- 경기 빌드는 기본 펫이 `Airo`이고 기본 바로가기에 `하이러닝`(`https://hi.goe.go.kr/`)이 포함됨

## 2. 릴리스 준비

새 버전 준비:

```bash
npm run release:prepare -- 0.1.1
```

통과 기준:

- `package.json`, `package-lock.json`, `Cargo.toml`, `tauri.conf.json` 버전이 모두 같은 값으로 갱신됨
- `RELEASE_NOTES.md`가 현재 버전과 최근 커밋 목록으로 갱신됨
- 버전 변경 후 `npm run release:check` 통과
- 릴리스 커밋은 Lore protocol 형식으로 작성
- 배포 태그는 `desktop-vX.Y.Z` 형식을 사용
- 태그를 푸시하면 `Desktop Release` workflow가 macOS/Windows 산출물을 빌드하고 GitHub Release를 생성함

릴리스 발행:

```bash
git tag desktop-v0.1.1
git push origin desktop-v0.1.1
```

수동 재발행:

```bash
gh workflow run "Desktop Release" --repo techkwon/codex-pet -f tag=desktop-v0.1.1
```

릴리스 확인:

- GitHub Release 제목이 `Codex Pet X.Y.Z` 형식
- Release body가 `apps/desktop/RELEASE_NOTES.md` 내용과 일치
- 첨부 파일에 macOS `.dmg`, macOS portable `.zip`, Windows `.msi`, Windows NSIS `.exe`, Windows portable `.zip` 포함
- 표준 빌드와 경기 빌드(`Codex Pet Gyeonggi`) 산출물이 모두 포함

## 3. 서명/노터라이즈 준비

현재 기본 배포는 unsigned portable/test build를 허용합니다. 실제 상업 릴리스에서 서명을 강제하려면 GitHub repository variable `REQUIRE_SIGNING=true`를 설정합니다.

로컬 점검:

```bash
npm run signing:check
npm run signing:check:strict
```

macOS GitHub Secrets:

- `APPLE_CERTIFICATE`: `.p12` certificate base64
- `APPLE_CERTIFICATE_PASSWORD`: certificate export password
- `APPLE_SIGNING_IDENTITY`: Developer ID Application signing identity
- `APPLE_API_KEY`: App Store Connect API key id
- `APPLE_API_ISSUER`: App Store Connect issuer id
- `APPLE_API_KEY_PATH`: private key file path on runner, if using key file based notarization
- `APPLE_ID`: Apple account email, when using Apple ID based notarization
- `APPLE_PASSWORD`: app-specific password, when using Apple ID based notarization
- `APPLE_TEAM_ID`: team id, when using Apple ID based notarization

Windows GitHub Secrets:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_CLIENT_SECRET`

Windows optional:

- `TAURI_WINDOWS_SIGNTOOL_PATH`

통과 기준:

- unsigned test build: `npm run signing:check`가 누락 항목을 출력하되 exit 0
- signed release build: `REQUIRE_SIGNING=true npm run signing:check` 또는 `npm run signing:check:strict` 통과
- GitHub Release가 signed 배포로 전환되면 `Desktop Release` workflow에서 signing readiness가 실패하지 않음
- macOS notarization과 Windows SmartScreen 완화는 실제 인증서/계정 준비 후 별도 수동 검증

참고:

- Tauri macOS signing/notarization: https://v2.tauri.app/distribute/sign/macos/
- Tauri Windows signing: https://v2.tauri.app/distribute/sign/windows/

## 4. 기능 회귀 확인

- 보안 설정: `tauri.conf.json`의 `app.security.csp`가 `null`이 아니고 원격 script/style 로딩을 허용하지 않음
- 보안 설정: 설치한 외부 펫 이미지는 `assetProtocol`의 앱 데이터 `pets/` 범위 안에서만 로딩됨
- 펫 클릭 메뉴: 집중 시작/정지, 빠른 알림, 오늘 루틴, 펫 변경, 펫 추가, 설정 동작
- 루틴: 과목명, 집중 시간, 쉬는 시간, 알림 시각, 반복 요일, 알림 메시지 저장
- 반복 알림: 앱 실행 중 오늘 요일과 알림 시각이 맞으면 OS 알림 표시
- 펫 창: 표시/숨김, 항상 위 표시, 클릭 메뉴 표시
- 백그라운드 실행: 메인 설정 창 닫기 시 앱은 종료되지 않고 트레이/메뉴바에 상주
- 시스템 트레이/메뉴바: 설정 열기, 오늘 루틴, 집중 시작, 펫 보이기, 펫 숨기기, 종료 동작
- 자동 시작: 설정에서 `OS 시작 시 자동 실행`을 켜고 끌 수 있음
- Codex 펫 추가: 로컬 폴더, GitHub 폴더, `pet.json` URL, ZIP URL 검증
- Codex 펫 표시: 내장 `Calico`/`Max`/`Haro`/`Airo`와 설치한 외부 펫의 `spritesheet.webp`가 CSP 적용 후에도 표시됨
- 바로가기: URL 열기, 파일 경로 열기, 활성/비활성, 삭제
- 리소스 반응: CPU/메모리/배터리 배지 표시, 배터리 없는 기기에서 `BAT -` 표시
- 데이터 관리: ZIP 백업 내보내기, ZIP 백업 가져오기, 지원용 진단 ZIP 내보내기, 앱 데이터 폴더 열기
- 백업 복구: 루틴/설정/바로가기/설치한 펫이 복구되고 외부 펫 경로가 현재 앱 데이터 폴더 기준으로 재작성됨
- 진단 ZIP: `diagnostics.json`, `state-redacted.json` 포함, 바로가기 대상 URL/파일 경로와 로컬 절대경로는 포함하지 않음
- 업데이트 확인: 버튼을 눌렀을 때만 GitHub `desktop-v*` 릴리스를 확인하고 최신 버전/릴리스 페이지를 표시

## 5. 초경량 기준

macOS 기준 측정:

```bash
npm run measure:mac
```

현재 기준선:

| 상태 | 샘플 | 평균 CPU | 최대 CPU | 평균 메모리 | 최대 메모리 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 메인 창 표시, 펫 창 숨김 | 20초 | 0.88% | 1.30% | 94.98MiB | 95.05MiB |

배포 전 목표:

- 메인 창 표시 상태 평균 CPU 2% 이하
- 펫 창 숨김 상태에서 불필요한 프론트 애니메이션 루프 없음
- 메모리 사용량이 20초 측정 중 계속 증가하지 않음
- portable ZIP과 DMG 용량이 각각 25MiB 이하

## 6. 배포 산출물

macOS:

```text
src-tauri/target/release/bundle/macos/Codex Pet.app
src-tauri/target/release/bundle/dmg/Codex Pet_0.1.0_aarch64.dmg
src-tauri/target/release/bundle/portable/Codex-Pet_macos_aarch64_portable.zip
```

Windows는 별도 Windows 환경에서 `npm run build` 후 `msi`, `nsis`, portable ZIP을 확인합니다.

Windows:

```text
src-tauri/target/release/bundle/msi/*.msi
src-tauri/target/release/bundle/nsis/*.exe
src-tauri/target/release/bundle/portable/Codex-Pet_windows_x64_portable.zip
```

경기 빌드:

```text
Codex Pet Gyeonggi_0.1.0_aarch64.dmg
Codex-Pet-Gyeonggi_macos_aarch64_portable.zip
Codex Pet Gyeonggi_0.1.0_x64-setup.exe
Codex Pet Gyeonggi_0.1.0_x64_en-US.msi
Codex-Pet-Gyeonggi_windows_x64_portable.zip
```

CI:

- Workflow: `.github/workflows/desktop-build.yml`
- Trigger: `main` push, pull request, manual `workflow_dispatch`
- Artifacts: `codex-pet-macos-arm64`, `codex-pet-gyeonggi-macos-arm64`, `codex-pet-windows-x64`, `codex-pet-gyeonggi-windows-x64`

Release:

- Workflow: `.github/workflows/desktop-release.yml`
- Trigger: `desktop-v*` tag push, manual `workflow_dispatch`
- Publishes: GitHub Release with macOS and Windows installer/portable assets

Update check:

- 앱은 백그라운드 자동 다운로드를 하지 않음
- 사용자가 `업데이트 확인`을 누를 때만 `techkwon/codex-pet` GitHub Releases를 조회
- 대상 태그는 `desktop-vX.Y.Z` 형식
- 새 버전이 있으면 릴리스 페이지를 열어 사용자가 직접 다운로드
- 자동 설치 업데이트는 signed release와 updater key 준비 후 별도 단계로 전환

## 7. 사용자 데이터 관리

- 백업 파일은 `codex-pet-backup-YYYY-MM-DD.zip` 형식을 권장합니다.
- 백업 ZIP에는 `state.json`과 앱 데이터 폴더의 `pets/`가 포함됩니다.
- 복구 시 ZIP 내부 경로를 검증하고 `state.json` 파싱에 실패하면 복구를 중단합니다.
- 복구 후 설치 펫의 `pet.json`/`spritesheet.webp` 경로는 현재 기기의 앱 데이터 폴더 기준으로 다시 저장됩니다.
- 계정/서버 없이도 사용자가 루틴, 설정, 바로가기, 설치한 Codex 펫을 이동할 수 있어야 합니다.

## 8. 지원/진단

- 진단 파일은 `codex-pet-diagnostics-YYYY-MM-DD.zip` 형식을 권장합니다.
- 진단 ZIP은 앱 버전, Tauri 버전, OS/arch, 앱 데이터 폴더 존재 여부, 루틴 수, 설치 펫 요약, 리소스 설정 상태를 포함합니다.
- 진단 ZIP의 `state-redacted.json`은 루틴 길이/시간 설정과 설치 펫 요약을 포함하되, 루틴 제목/메시지 본문, 사용자 바로가기 대상 URL/파일 경로, 로컬 절대경로는 포함하지 않습니다.
- 사용자가 문제를 보고할 때 백업 ZIP 대신 진단 ZIP을 먼저 요청합니다.

## 9. 배포 제외 사항

- Mac App Store 등록 제외
- 계정/서버/클라우드 동기화 제외
- 네트워크/디스크/GPU 모니터링 제외
- 글로벌 단축키 제외
