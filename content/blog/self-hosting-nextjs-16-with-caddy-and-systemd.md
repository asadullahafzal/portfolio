---
title: "Self-hosting Next.js 16 on a VPS with Caddy and systemd"
description: "How I deployed my portfolio to a VPS that already ran another app: Next.js standalone output, a systemd service, a Caddy site with automatic HTTPS, and a one-command deploy that rolls back on failure."
date: 2026-10-09
tags: [Next.js, DevOps, Caddy, Linux]
---

My portfolio runs on my own VPS rather than a managed platform. It costs nothing extra, I control everything, and setting it up taught me more than clicking "Deploy" would have.

There was one twist: the server wasn't empty. **Caddy** already held ports 80 and 443 for another app of mine, a scraper dashboard. Here's how I fitted a Next.js 16 site in next to it without touching it.

## Look before you install

My first plan was Docker + Nginx + Certbot. Before running anything, I inspected the server:

```bash
ss -ltnp                     # what's listening on which ports?
systemctl list-units --type=service --state=running
cat /etc/caddy/Caddyfile
```

Caddy was serving the dashboard on 443. Installing Nginx would have fought it for the same ports and taken the dashboard down. So instead of bringing a new stack, I matched the existing one: **a systemd service behind Caddy**.

## 1. Build a standalone server

Next.js can bundle just what production needs into `.next/standalone`, with no `node_modules` install on the server:

```ts
// next.config.ts
const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
};
```

The one gotcha: the standalone server doesn't include `public/` or `.next/static`, so they have to be copied in:

```bash
cp -a .next/standalone release
cp -a .next/static release/.next/static
cp -a public release/public
```

## 2. Run it as a systemd service

The site runs as its own unprivileged user, listening only on localhost, so the outside world can only reach it through Caddy:

```ini
[Service]
User=portfolio
WorkingDirectory=/home/portfolio/app
Environment=NODE_ENV=production PORT=3000 HOSTNAME=127.0.0.1
EnvironmentFile=-/etc/portfolio.env
ExecStart=/usr/bin/node server.js
Restart=always
NoNewPrivileges=true
ProtectSystem=full
```

`Restart=always` brings it back after a crash or reboot. Secrets (like the contact form's webhook URL) live in `/etc/portfolio.env`, readable by root only and never committed to git.

## 3. Add one Caddy site

Caddy gets HTTPS certificates from Let's Encrypt and renews them automatically, so the whole web-server config is a few lines:

```text
www.asadullahafzal.com {
	redir https://asadullahafzal.com{uri} permanent
}

asadullahafzal.com {
	encode zstd gzip
	@static path /_next/static/*
	header @static Cache-Control "public, max-age=31536000, immutable"
	reverse_proxy 127.0.0.1:3000
}
```

Because the other app was live, I treated this edit carefully: back up the Caddyfile, **validate before reloading**, and restore the backup automatically if validation fails:

```bash
cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak-$(date +%Y%m%d-%H%M%S)
caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile && systemctl reload caddy
```

I recorded the dashboard's response before the change and checked it again after. Identical.

## 4. One-command deploys with rollback

Updates are a single script: pull, install, build, then swap releases:

```bash
mv "$LIVE" "$PREVIOUS"
mv "$STAGING" "$LIVE"
systemctl restart portfolio

for _ in $(seq 1 30); do
  curl -fsS -o /dev/null http://127.0.0.1:3000/ 2>/dev/null && exit 0
  sleep 1
done

# Didn't come up: put the previous release back
mv "$PREVIOUS" "$LIVE" && systemctl restart portfolio
```

The build happens *before* the swap, so the old version keeps serving while the new one compiles, and a bad release rolls itself back.

A small but important detail: the script updates itself with `git pull` while running. Bash reads scripts incrementally, so I wrapped everything in a `main()` function called on the last line. Bash parses the whole function before executing it, so the pull can't change the code mid-run.

## 5. Line endings will bite you on Windows

I develop on Windows. Git can check shell scripts out with CRLF line endings, and then they fail on Linux with baffling errors. A `.gitattributes` file prevents it:

```text
*.sh       text eol=lf
*.service  text eol=lf
*.caddy    text eol=lf
```

## The result

- HTTPS with automatic renewal, `www` redirecting to the bare domain
- The app answers in **about 10 ms** on the server
- Deploys are one command, and a broken release rolls back on its own
- The existing app never noticed a thing

The full setup is in the [portfolio repository](https://github.com/asadullahafzal/portfolio) under `deploy/`.
