# Deploying asadullahafzal.com to the VPS

How it runs: **Docker** runs the Next.js site on the VPS (port 3000, not public) →
**Nginx** serves it on ports 80/443 → **Let's Encrypt** provides free HTTPS.

## 1. Point the domain at the VPS

At your domain registrar's DNS settings, create these records (replace `YOUR_VPS_IP`):

| Type | Name / Host | Value          | TTL  |
| ---- | ----------- | -------------- | ---- |
| A    | `@`         | `YOUR_VPS_IP`  | Auto |
| A    | `www`       | `YOUR_VPS_IP`  | Auto |

Delete any other A/AAAA or "parking" records for `@` and `www`. DNS can take from a few
minutes to a few hours to update. Check with:

```bash
nslookup asadullahafzal.com
```

## 2. Log in to the VPS

```bash
ssh root@YOUR_VPS_IP
```

## 3. Get the code onto the VPS

```bash
git clone https://github.com/asadullahafzal/portfolio.git /opt/portfolio
cd /opt/portfolio
```

(For a private repo, GitHub will ask you to sign in; use a personal access token as the password.)

## 4. Install everything and start the site

```bash
sudo bash deploy/setup-vps.sh
```

This installs Docker, Nginx and Certbot, sets up the Nginx site, then builds and starts the site.
The first build takes a few minutes. When it finishes, `http://asadullahafzal.com` works
(once DNS from step 1 has updated).

## 5. Turn on HTTPS

Once `http://asadullahafzal.com` loads, run:

```bash
sudo certbot --nginx -d asadullahafzal.com -d www.asadullahafzal.com --redirect --agree-tos -m asadullahafzal840@gmail.com
```

Certbot gets the certificate, switches the site to HTTPS and renews it automatically.

## Updating the site later

Push changes to GitHub from your computer, then on the VPS:

```bash
cd /opt/portfolio && bash deploy/deploy.sh
```

## Useful commands (on the VPS)

| What                    | Command                                  |
| ----------------------- | ---------------------------------------- |
| See if the site is up   | `docker compose ps`                      |
| View site logs          | `docker compose logs -f web`             |
| Restart the site        | `docker compose restart web`             |
| Test the Nginx config   | `sudo nginx -t`                          |
| Check HTTPS renewal     | `sudo certbot renew --dry-run`           |
