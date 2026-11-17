#!/usr/bin/env bash
# (c) 2026, Micro:bit Educational Foundation and contributors
# SPDX-License-Identifier: MIT

set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
compose_file="${script_dir}/compose.yml"

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: Docker is not installed." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Error: The Docker Compose plugin is required (docker compose)." >&2
  exit 1
fi

if [[ ! -f "$compose_file" ]]; then
  echo "Error: ${compose_file} is missing. Place compose.yml next to deploy.sh." >&2
  exit 1
fi

compose=(docker compose --project-directory "$script_dir" -f "$compose_file")

"${compose[@]}" config --quiet

echo "Pulling the latest editor image …"
"${compose[@]}" pull editor

echo "Starting or updating the editor …"
"${compose[@]}" up -d --wait --wait-timeout 60 editor

"${compose[@]}" ps editor
echo "Deployment complete. See the published port above."
