#!/bin/bash
set -Eeuo pipefail

WORKSPACE_ROOT="${WORKSPACE_ROOT:-$(pwd)}"

cd "${WORKSPACE_ROOT}"

echo "Installing dependencies..."
pnpm install --prefer-frozen-lockfile --prefer-offline --loglevel debug --reporter=append-only
