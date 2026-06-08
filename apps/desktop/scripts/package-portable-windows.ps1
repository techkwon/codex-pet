$ErrorActionPreference = "Stop"

$RootDir = Resolve-Path (Join-Path $PSScriptRoot "..")
$ExePath = Join-Path $RootDir "src-tauri\target\release\highlearning-pet-reminder.exe"
$OutDir = Join-Path $RootDir "src-tauri\target\release\bundle\portable"
$AppName = "Codex Pet"
if ($env:CODEX_PET_VARIANT -eq "gyeonggi") {
  $AppName = "Codex Pet Gyeonggi"
}
$PackageName = $AppName.Replace(" ", "-")
$PackageDir = Join-Path $OutDir "${PackageName}_windows_x64_portable"
$ZipPath = "$PackageDir.zip"

if (!(Test-Path $ExePath)) {
  Write-Error "Missing executable: $ExePath. Run npm run build first."
}

if (Test-Path $PackageDir) {
  Remove-Item -Recurse -Force $PackageDir
}
if (Test-Path $ZipPath) {
  Remove-Item -Force $ZipPath
}

New-Item -ItemType Directory -Force -Path $PackageDir | Out-Null
Copy-Item $ExePath (Join-Path $PackageDir "$AppName.exe")

@"
$AppName Portable

Run "$AppName.exe" to start the app.
Data is stored in the local application data directory.
Codex-compatible pets can be imported from pet.json + spritesheet.webp folders, GitHub URLs, or ZIP URLs.
"@ | Set-Content -Encoding UTF8 (Join-Path $PackageDir "README.txt")

Compress-Archive -Path (Join-Path $PackageDir "*") -DestinationPath $ZipPath
Write-Output $ZipPath
