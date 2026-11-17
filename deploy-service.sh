#!/usr/bin/env bash

# Deploys (or updates) the production stack from docker-compose.yml.
# Run on the server from the directory holding both files:
#   ./deploy-service.sh

set -euo pipefail

cd "$(dirname "$0")"
compose() { docker compose -f docker-compose.yml "$@"; }

compose pull
compose up -d --remove-orphans
docker image prune -f >/dev/null
compose ps