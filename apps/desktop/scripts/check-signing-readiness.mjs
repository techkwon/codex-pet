#!/usr/bin/env node
const args = process.argv.slice(2);
const strict = args.includes("--strict") || process.env.REQUIRE_SIGNING === "true";

function isSet(name) {
  return Boolean(process.env[name]?.trim());
}

function simpleCheck({ name, required, optional = [], docs }) {
  const missing = required.filter((item) => !isSet(item));
  return {
    name,
    ready: missing.length === 0,
    details: missing.length > 0 ? [`missing: ${missing.join(", ")}`] : [],
    optionalPresent: optional.filter(isSet),
    docs,
  };
}

function notarizationCheck() {
  const appStoreConnect = ["APPLE_API_KEY", "APPLE_API_ISSUER", "APPLE_API_KEY_PATH"];
  const appleId = ["APPLE_ID", "APPLE_PASSWORD", "APPLE_TEAM_ID"];
  const appStoreMissing = appStoreConnect.filter((item) => !isSet(item));
  const appleIdMissing = appleId.filter((item) => !isSet(item));
  const ready = appStoreMissing.length === 0 || appleIdMissing.length === 0;
  return {
    name: "macOS notarization",
    ready,
    details: ready
      ? []
      : [
          `missing App Store Connect route: ${appStoreMissing.join(", ")}`,
          `missing Apple ID route: ${appleIdMissing.join(", ")}`,
        ],
    optionalPresent: [],
    docs: "https://v2.tauri.app/distribute/sign/macos/#notarization",
  };
}

const results = [
  simpleCheck({
    name: "macOS certificate signing",
    required: ["APPLE_CERTIFICATE", "APPLE_CERTIFICATE_PASSWORD", "APPLE_SIGNING_IDENTITY"],
    docs: "https://v2.tauri.app/distribute/sign/macos/",
  }),
  notarizationCheck(),
  simpleCheck({
    name: "Windows Azure Trusted Signing",
    required: ["AZURE_CLIENT_ID", "AZURE_TENANT_ID", "AZURE_CLIENT_SECRET"],
    optional: ["TAURI_WINDOWS_SIGNTOOL_PATH"],
    docs: "https://v2.tauri.app/distribute/sign/windows/",
  }),
];

for (const result of results) {
  const status = result.ready ? "READY" : strict ? "MISSING" : "PENDING";
  console.log(`${status}: ${result.name}`);
  for (const detail of result.details) {
    console.log(`  ${detail}`);
  }
  if (result.optionalPresent.length > 0) {
    console.log(`  optional present: ${result.optionalPresent.join(", ")}`);
  }
  console.log(`  docs: ${result.docs}`);
}

const missing = results.filter((result) => !result.ready);
if (strict && missing.length > 0) {
  console.error("Signing readiness failed. Configure the missing CI secrets or unset REQUIRE_SIGNING for unsigned test builds.");
  process.exit(1);
}

if (missing.length > 0) {
  console.log("Unsigned build mode: signing requirements are documented but not enforced.");
} else {
  console.log("Signing readiness complete.");
}
