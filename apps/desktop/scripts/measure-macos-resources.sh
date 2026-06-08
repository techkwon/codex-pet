#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_NAME="Codex Pet"
APP_PATH="$ROOT_DIR/src-tauri/target/release/bundle/macos/$APP_NAME.app"
SAMPLES="${1:-20}"
INTERVAL="${2:-1}"

if [[ ! -d "$APP_PATH" ]]; then
  echo "Missing app bundle: $APP_PATH" >&2
  echo "Run npm run build first." >&2
  exit 1
fi

open -n "$APP_PATH"
sleep 5

PID="$(pgrep -fn "$APP_PATH/Contents/MacOS/highlearning-pet-reminder" || true)"
if [[ -z "$PID" ]]; then
  echo "Unable to find running app process." >&2
  exit 1
fi

TMP="$(mktemp)"
trap 'rm -f "$TMP"; kill "$PID" >/dev/null 2>&1 || true' EXIT

for _ in $(seq 1 "$SAMPLES"); do
  ps -p "$PID" -o %cpu=,rss= >> "$TMP"
  sleep "$INTERVAL"
done

awk -v samples="$SAMPLES" -v interval="$INTERVAL" '
  NF >= 2 {
    cpu=$1 + 0
    rss=($2 + 0) / 1024
    cpu_sum += cpu
    rss_sum += rss
    if (cpu > cpu_max) cpu_max = cpu
    if (rss > rss_max) rss_max = rss
    count += 1
  }
  END {
    if (count == 0) {
      print "{\"error\":\"no samples\"}"
      exit 1
    }
    printf "{\n"
    printf "  \"sampleCount\": %d,\n", count
    printf "  \"durationSeconds\": %d,\n", samples * interval
    printf "  \"cpuAvgPercent\": %.3f,\n", cpu_sum / count
    printf "  \"cpuMaxPercent\": %.3f,\n", cpu_max
    printf "  \"memoryAvgMiB\": %.2f,\n", rss_sum / count
    printf "  \"memoryMaxMiB\": %.2f\n", rss_max
    printf "}\n"
  }
' "$TMP"
