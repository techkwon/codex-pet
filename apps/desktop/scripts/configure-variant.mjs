#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(scriptDir, "..");
const variant = process.env.CODEX_PET_VARIANT ?? "standard";
const configPath = resolve(appDir, "src-tauri/tauri.conf.json");
const config = JSON.parse(readFileSync(configPath, "utf8"));

if (variant === "gyeonggi") {
  config.productName = "Codex Pet Gyeonggi";
  config.identifier = "com.highlearning.codexpet.gyeonggi";
  for (const window of config.app?.windows ?? []) {
    if (window.label === "main") window.title = "Codex Pet Gyeonggi Settings";
  }
} else {
  config.productName = "Codex Pet";
  config.identifier = "com.highlearning.petreminder";
  for (const window of config.app?.windows ?? []) {
    if (window.label === "main") window.title = "Codex Pet Settings";
  }
}

writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
console.log(`Configured Codex Pet variant: ${variant}`);
