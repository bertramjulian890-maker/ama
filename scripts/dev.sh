#!/bin/bash
set -Eeuo pipefail


WORKSPACE_ROOT="${WORKSPACE_ROOT:-$(pwd)}"

# macOS 常把 5000 留给「隔空播放接收器」，Next 会 EADDRINUSE；未指定 PORT 时开发默认用 3000
if [[ -z "${PORT:-}" ]]; then
  if [[ "$(uname -s)" == "Darwin" ]]; then
    PORT=3000
  else
    PORT=5000
  fi
fi
DEPLOY_RUN_PORT="${DEPLOY_RUN_PORT:-$PORT}"


cd "${WORKSPACE_ROOT}"

kill_port_if_listening() {
    local pids=""

    if command -v lsof >/dev/null 2>&1; then
      pids=$(lsof -ti tcp:"${DEPLOY_RUN_PORT}" -sTCP:LISTEN 2>/dev/null | paste -sd' ' - || true)
    elif command -v ss >/dev/null 2>&1; then
      pids=$(ss -H -lntp 2>/dev/null | awk -v port="${DEPLOY_RUN_PORT}" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | paste -sd' ' - || true)
    fi

    if [[ -z "${pids}" ]]; then
      echo "Port ${DEPLOY_RUN_PORT} is free."
      return
    fi

    echo "Port ${DEPLOY_RUN_PORT} in use by PIDs: ${pids} (SIGKILL)"
    kill -9 ${pids} 2>/dev/null || true
    sleep 1

    pids=""
    if command -v lsof >/dev/null 2>&1; then
      pids=$(lsof -ti tcp:"${DEPLOY_RUN_PORT}" -sTCP:LISTEN 2>/dev/null | paste -sd' ' - || true)
    elif command -v ss >/dev/null 2>&1; then
      pids=$(ss -H -lntp 2>/dev/null | awk -v port="${DEPLOY_RUN_PORT}" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | paste -sd' ' - || true)
    fi

    if [[ -n "${pids}" ]]; then
      echo "Warning: port ${DEPLOY_RUN_PORT} still busy after SIGKILL, PIDs: ${pids}"
    else
      echo "Port ${DEPLOY_RUN_PORT} cleared."
    fi
}

echo "Clearing port ${PORT} before start."
kill_port_if_listening
echo "Starting HTTP service on port ${PORT} for dev..."

PORT=$PORT pnpm tsx watch src/server.ts
