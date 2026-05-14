#!/bin/bash
set -Eeuo pipefail

WORKSPACE_ROOT="${WORKSPACE_ROOT:-$(pwd)}"

# Render / Fly / Heroku 会注入 PORT；本地默认 5000
DEPLOY_RUN_PORT="${PORT:-5000}"


start_service() {
    cd "${WORKSPACE_ROOT}"
    echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."
    PORT=${DEPLOY_RUN_PORT} node dist/server.js
}

echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."
start_service
