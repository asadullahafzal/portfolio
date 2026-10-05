#!/usr/bin/env bash
# Build and ship the latest version from GitHub. Run on the VPS as root:
#   bash /home/portfolio/portfolio/deploy/deploy.sh
#
# Builds in the source folder, assembles the release in a staging folder, then
# swaps it in and restarts the service. If the new version doesn't respond,
# it rolls back to the previous one automatically.
set -euo pipefail

APP_USER=portfolio
SRC=/home/portfolio/portfolio
LIVE=/home/portfolio/app
STAGE=/home/portfolio/app.staging
PREV=/home/portfolio/app.previous

# Everything lives in main(), which bash reads fully before running, so
# `git pull` can safely update this very file mid-deploy.
main() {
  [[ $EUID -eq 0 ]] || { echo "Please run as root."; exit 1; }
  as_app() { sudo -u "$APP_USER" -H bash -c "cd '$SRC' && $1"; }

  echo "==> Pulling latest code"
  as_app "git pull --ff-only"

  echo "==> Installing dependencies"
  as_app "npm ci --no-audit --no-fund --loglevel=error"

  echo "==> Building"
  as_app "NEXT_TELEMETRY_DISABLED=1 npm run build"

  echo "==> Assembling release"
  rm -rf "$STAGE"
  cp -a "$SRC/.next/standalone" "$STAGE"
  cp -a "$SRC/.next/static" "$STAGE/.next/static"
  cp -a "$SRC/public" "$STAGE/public"
  chown -R "$APP_USER:$APP_USER" "$STAGE"

  echo "==> Switching to the new release"
  rm -rf "$PREV"
  [[ -d "$LIVE" ]] && mv "$LIVE" "$PREV"
  mv "$STAGE" "$LIVE"
  systemctl restart portfolio

  echo "==> Checking the site responds"
  for _ in $(seq 1 30); do
    if curl -fsS -o /dev/null http://127.0.0.1:3000/; then
      echo "Live: $(as_app "git log -1 --format='%h %s'")"
      exit 0
    fi
    sleep 1
  done

  echo "!! New version didn't respond. Rolling back."
  journalctl -u portfolio -n 30 --no-pager || true
  if [[ -d "$PREV" ]]; then
    rm -rf "$LIVE" && mv "$PREV" "$LIVE" && systemctl restart portfolio
    echo "Rolled back to the previous version."
  fi
  exit 1
}

main "$@"
