#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(scriptDir, "..");
const distDir = resolve(appDir, "dist");
const viteBin = resolve(appDir, "node_modules/vite/bin/vite.js");
const previewUrl = "http://127.0.0.1:1420";
const requiredPets = ["calico", "max", "haro", "airo"];
const requiredUiText = [
  "Codex",
  "Pet Settings",
  "오늘 루틴",
  "학습 루틴",
  "Codex 펫 추가",
  "Calico",
  "Max",
  "Haro",
  "Airo",
];

const failures = [];

function fail(message) {
  failures.push(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

async function fetchText(pathname) {
  const response = await fetch(`${previewUrl}${pathname}`);
  if (!response.ok) {
    throw new Error(`GET ${pathname} returned ${response.status}`);
  }
  return response.text();
}

async function fetchOk(pathname) {
  const response = await fetch(`${previewUrl}${pathname}`);
  if (!response.ok) {
    throw new Error(`GET ${pathname} returned ${response.status}`);
  }
  return response;
}

function waitForPreview(child) {
  return new Promise((resolveReady, rejectReady) => {
    let settled = false;
    const output = [];
    const startedAt = Date.now();

    function settle(error) {
      if (settled) return;
      settled = true;
      if (error) rejectReady(error);
      else resolveReady(undefined);
    }

    async function poll() {
      while (!settled && Date.now() - startedAt < 20_000) {
        try {
          const response = await fetch(previewUrl);
          if (response.ok) {
            settle();
            return;
          }
        } catch {
          // Retry until Vite binds the preview port.
        }
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
      }
      settle(new Error(`Vite preview did not respond within 20 seconds\n${output.join("")}`));
    }

    child.stdout.on("data", (chunk) => output.push(String(chunk)));
    child.stderr.on("data", (chunk) => output.push(String(chunk)));
    child.once("error", (error) => {
      settle(error);
    });
    child.once("exit", (code) => {
      settle(new Error(`Vite preview exited early with code ${code}\n${output.join("")}`));
    });

    poll();
  });
}

function bundledAssetPaths(html) {
  const matches = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
  return matches.filter((value) => value.startsWith("/assets/"));
}

async function main() {
  assert(existsSync(distDir), "dist directory exists; run npm run build:ui before smoke:preview");
  for (const pet of requiredPets) {
    assert(existsSync(resolve(distDir, "pets", pet, "pet.json")), `dist includes ${pet}/pet.json`);
    assert(existsSync(resolve(distDir, "pets", pet, "spritesheet.webp")), `dist includes ${pet}/spritesheet.webp`);
  }

  assert(existsSync(viteBin), "Vite binary exists in node_modules");

  const child = spawn(process.execPath, [viteBin, "preview", "--host", "127.0.0.1", "--port", "1420", "--strictPort"], {
    cwd: appDir,
    env: { ...process.env, BROWSER: "none" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  try {
    await waitForPreview(child);
    const html = await fetchText("/");
    assert(html.includes('<div id="root"></div>'), "preview HTML contains React root");
    assert(html.includes("<title>Codex Pet</title>"), "preview HTML title is correct");

    const assetPaths = bundledAssetPaths(html);
    assert(assetPaths.some((path) => path.endsWith(".js")), "preview HTML references JS bundle");
    assert(assetPaths.some((path) => path.endsWith(".css")), "preview HTML references CSS bundle");
    for (const assetPath of assetPaths) {
      await fetchOk(assetPath);
    }

    for (const pet of requiredPets) {
      const manifest = await fetchText(`/pets/${pet}/pet.json`);
      assert(JSON.parse(manifest).id === pet, `preview serves ${pet} manifest`);
      const spritesheet = await fetchOk(`/pets/${pet}/spritesheet.webp`);
      assert(spritesheet.headers.get("content-type")?.includes("image/"), `preview serves ${pet} spritesheet as image`);
    }

    const jsBundles = readdirSync(resolve(distDir, "assets"))
      .filter((name) => name.endsWith(".js"))
      .map((name) => readFileSync(resolve(distDir, "assets", name), "utf8"))
      .join("\n");
    for (const text of requiredUiText) {
      assert(jsBundles.includes(text), `JS bundle contains '${text}'`);
    }
  } finally {
    child.kill("SIGTERM");
  }

  if (failures.length > 0) {
    for (const message of failures) console.error(`FAIL ${message}`);
    process.exit(1);
  }

  console.log("Preview smoke passed: shell, bundles, pet assets, and core UI strings are present.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
