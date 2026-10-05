#!/usr/bin/env bash
# Ship the latest version. Run on the VPS from the project folder:
#   bash deploy/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Pulling latest code"
git pull --ff-only

echo "==> Rebuilding and restarting (the old version keeps serving until the new one is ready)"
docker compose up -d --build

echo "==> Cleaning up old images"
docker image prune -f >/dev/null

echo "==> Checking the site responds"
for i in $(seq 1 30); do
  if curl -fsS -o /dev/null http://127.0.0.1:3000/; then
    echo "Live: $(git log -1 --format='%h %s')"
    exit 0
  fi
  sleep 2
done
echo "!! The site didn't respond. Logs:"
docker compose logs --tail=50 web
exit 1
