#!/bin/bash
set -Eeuo pipefail

WORKSPACE_ROOT="${WORKSPACE_ROOT:-$(pwd)}"

cd "${WORKSPACE_ROOT}"

echo "🔍 Running validate..."
pnpm validate
echo "✅ Validate passed!"
