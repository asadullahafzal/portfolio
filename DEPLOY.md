# Deploying asadullahafzal.com

The site runs on the VPS (213.199.35.218, Ubuntu 24.04) next to the scraper dashboard:

```
Visitor ──HTTPS──▶ Caddy (ports 80/443, automatic certificates)
                     ├─ scrape.thedollartech.org ─▶ scraper dashboard (127.0.0.1:8700)
                     └─ asadullahafzal.com       ─▶ portfolio.service (127.0.0.1:3000)
```

| What | Where |
| --- | --- |
| Source code (git clone) | `/home/portfolio/portfolio` |
| Running release | `/home/portfolio/app` (previous one kept in `app.previous`) |
| Service | `portfolio.service` (runs as the `portfolio` user) |
| Web server config | `/etc/caddy/Caddyfile` |

## Updating the site

1. Commit and push your changes to GitHub from your computer.
2. On the VPS, as root:

```bash
bash /home/portfolio/portfolio/deploy/deploy.sh
```

It pulls, builds, swaps in the new version and restarts. If the new version doesn't
respond, it automatically rolls back to the previous one.

## Contact form settings

The contact form forwards messages to n8n. Its settings live in `/etc/portfolio.env`
(readable by root only, never committed):

```
N8N_CONTACT_WEBHOOK_URL=https://YOUR-N8N/webhook/portfolio-contact
N8N_CONTACT_SECRET=<random string, also set in the n8n Webhook node>
```

After editing it: `systemctl restart portfolio`. Setup steps: [deploy/n8n/README.md](deploy/n8n/README.md).

## Useful commands (on the VPS)

| What | Command |
| --- | --- |
| Is the site running? | `systemctl status portfolio` |
| Live logs | `journalctl -u portfolio -f` |
| Restart the site | `systemctl restart portfolio` |
| Check the Caddy config | `caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile` |
| Apply Caddy changes | `systemctl reload caddy` |

## First-time setup (already done, kept for reference)

```bash
useradd --create-home --shell /usr/sbin/nologin portfolio
sudo -u portfolio git clone https://github.com/asadullahafzal/portfolio.git /home/portfolio/portfolio
cp /home/portfolio/portfolio/deploy/portfolio.service /etc/systemd/system/
systemctl daemon-reload && systemctl enable portfolio
bash /home/portfolio/portfolio/deploy/deploy.sh
cat /home/portfolio/portfolio/deploy/caddy/asadullahafzal.com.caddy >> /etc/caddy/Caddyfile
caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile && systemctl reload caddy
```

DNS: `A` records for `@` and `www` point to the VPS IP.

A `Dockerfile` and `docker-compose.yml` are also included if you ever want to run the site in Docker instead.
