#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(scriptDir, "..");
const repoDir = resolve(appDir, "../..");

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const version = args.find((arg) => !arg.startsWith("--"));
const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

const paths = {
  packageJson: resolve(appDir, "package.json"),
  packageLock: resolve(appDir, "package-lock.json"),
  cargoToml: resolve(appDir, "src-tauri/Cargo.toml"),
  tauriConfig: resolve(appDir, "src-tauri/tauri.conf.json"),
  releaseNotes: resolve(appDir, "RELEASE_NOTES.md"),
};

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function readCargoVersion() {
  const text = readFileSync(paths.cargoToml, "utf8");
  const match = text.match(/^version\s*=\s*"([^"]+)"/m);
  if (!match) throw new Error("Cargo.toml package version not found");
  return match[1];
}

function writeCargoVersion(nextVersion) {
  const text = readFileSync(paths.cargoToml, "utf8");
  writeFileSync(
    paths.cargoToml,
    text.replace(/^version\s*=\s*"[^"]+"/m, `version = "${nextVersion}"`),
  );
}

function currentVersions() {
  const packageJson = readJson(paths.packageJson);
  const packageLock = readJson(paths.packageLock);
  const tauriConfig = readJson(paths.tauriConfig);
  return {
    "package.json": packageJson.version,
    "package-lock.json": packageLock.version,
    "package-lock root": packageLock.packages?.[""]?.version,
    "Cargo.toml": readCargoVersion(),
    "tauri.conf.json": tauriConfig.version,
  };
}

function assertVersionsAligned() {
  const versions = currentVersions();
  const unique = new Set(Object.values(versions));
  if (unique.size !== 1) {
    const details = Object.entries(versions)
      .map(([name, value]) => `  ${name}: ${value}`)
      .join("\n");
    throw new Error(`Release versions are not aligned:\n${details}`);
  }
  return [...unique][0];
}

function git(args, fallback = "") {
  try {
    return execFileSync("git", args, {
      cwd: repoDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return fallback;
  }
}

function releaseNotes(nextVersion) {
  const today = new Date().toISOString().slice(0, 10);
  const lastTag = git(["describe", "--tags", "--abbrev=0"]);
  const range = lastTag ? `${lastTag}..HEAD` : "HEAD";
  const commits = git(["log", "--pretty=format:- %s (%h)", range])
    .split("\n")
    .filter(Boolean);
  const body = commits.length ? commits.join("\n") : "- Initial release candidate";
  return `# Codex Pet ${nextVersion}\n\nRelease date: ${today}\n\n## Changes\n\n${body}\n\n## Verification\n\n- npm run typecheck\n- npm run commercial:check\n- npm run build:ui\n- npm run smoke:preview\n- cargo check\n- npm run build\n- npm run package:portable:mac\n- GitHub Actions Desktop Build macOS arm64 / Windows x64\n\n## Distribution\n\n- macOS: app, dmg, portable zip\n- Windows: msi, nsis, portable zip\n`;
}

function updateVersion(nextVersion) {
  const packageJson = readJson(paths.packageJson);
  packageJson.version = nextVersion;
  writeJson(paths.packageJson, packageJson);

  const packageLock = readJson(paths.packageLock);
  packageLock.version = nextVersion;
  if (packageLock.packages?.[""]) packageLock.packages[""].version = nextVersion;
  writeJson(paths.packageLock, packageLock);

  writeCargoVersion(nextVersion);

  const tauriConfig = readJson(paths.tauriConfig);
  tauriConfig.version = nextVersion;
  writeJson(paths.tauriConfig, tauriConfig);

  writeFileSync(paths.releaseNotes, releaseNotes(nextVersion));
}

try {
  if (checkOnly) {
    const aligned = assertVersionsAligned();
    if (existsSync(paths.releaseNotes)) {
      const notes = readFileSync(paths.releaseNotes, "utf8");
      if (!notes.includes(aligned)) {
        throw new Error(`RELEASE_NOTES.md does not mention current version ${aligned}`);
      }
    }
    console.log(`Release metadata aligned at ${aligned}`);
    process.exit(0);
  }

  if (!version || !semver.test(version)) {
    throw new Error("Usage: npm run release:prepare -- <semver> or npm run release:check");
  }
  updateVersion(version);
  const aligned = assertVersionsAligned();
  console.log(`Prepared release ${aligned}`);
  console.log(`Updated ${paths.releaseNotes}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
