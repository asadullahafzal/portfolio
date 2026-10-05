#!/usr/bin/env bash
# One-time setup for a fresh Ubuntu VPS. Run from the project folder on the VPS:
#   sudo bash deploy/setup-vps.sh
# Safe to re-run. It does NOT enable a firewall or touch SSH settings.
set -euo pipefail

if [[ $EUID -ne 0 ]]; then echo "Please run with sudo."; exit 1; fi
cd "$(dirname "$0")/.."

echo "==> Installing Docker, Nginx, Certbot and Git"
apt-get update -y
apt-get install -y ca-certificates curl git nginx certbot python3-certbot-nginx
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker nginx

echo "==> Checking ports 80/443"
if ss -ltnp | grep -E ':(80|443)\s' | grep -vq nginx; then
  echo "!! Something other than Nginx is already using port 80 or 443:"
  ss -ltnp | grep -E ':(80|443)\s'
  echo "!! Stop it (or tell Claude what it is) before continuing."
  exit 1
fi

echo "==> Installing the Nginx site"
cp deploy/nginx/asadullahafzal.com.conf /etc/nginx/sites-available/asadullahafzal.com.conf
ln -sf /etc/nginx/sites-available/asadullahafzal.com.conf /etc/nginx/sites-enabled/asadullahafzal.com.conf
# The default "Welcome to nginx" site would otherwise answer for the bare IP
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# Only adjusts the firewall if ufw is already turned on
if command -v ufw >/dev/null 2>&1 && ufw status | grep -q "Status: active"; then
  echo "==> Allowing HTTP/HTTPS through ufw"
  ufw allow 'Nginx Full'
fi

echo "==> Building and starting the site"
docker compose up -d --build

echo
echo "Done. The site is running behind Nginx on port 80."
echo "Next: once DNS points to this server, enable HTTPS (see DEPLOY.md, step 5)."
