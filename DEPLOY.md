# NearPoint — VPS Deployment (Docker Compose)

Deploy the whole stack (PostgreSQL + Spring Boot backend + React frontend) on a
single server. [Caddy](https://caddyserver.com) sits in front as a reverse proxy
and provisions HTTPS automatically via Let's Encrypt.

```
Internet ──▶ Caddy (:80/:443, TLS)
                 ├─ /api/*  ──▶ backend  (:8070)
                 └─ /*      ──▶ frontend (nginx :80)
                                   backend ──▶ db (postgres :5432)
```

## 1. Prerequisites

- A VPS (Ubuntu 22.04+ recommended) with a public IP.
- A domain name with a **DNS A record** pointing to the VPS IP (e.g. `nearpoint.com → 1.2.3.4`).
- Ports **80** and **443** open in the firewall.
- Google Cloud API keys:
  - `GOOGLE_PLACES_API_KEY` — a **server** key with **Places API** enabled.
  - `REACT_APP_GOOGLE_MAPS_API_KEY` — a **browser** key with **Maps JavaScript API** enabled
    (restrict it to your domain in the Google Console).
- (Optional but recommended) **Cloudflare Turnstile** keys for bot protection — create a
  widget at Cloudflare Dashboard → Turnstile. You get a **site key** (public) and a
  **secret key**. Leave both blank to disable verification.

## 2. Install Docker on the server

```sh
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # log out/in afterwards so this takes effect
```

## 3. Get the code

```sh
git clone https://github.com/FurkanAksoyy/NearPoint.git
cd NearPoint
```

## 4. Configure environment

```sh
cp .env.example .env
nano .env
```

Fill in at minimum:

```env
POSTGRES_PASSWORD=<a-strong-password>
DOMAIN=yourdomain.com
ACME_EMAIL=you@yourdomain.com
GOOGLE_PLACES_API_KEY=<server-places-api-key>
REACT_APP_GOOGLE_MAPS_API_KEY=<browser-maps-js-api-key>

# Optional — Cloudflare Turnstile bot protection (leave blank to disable)
REACT_APP_TURNSTILE_SITE_KEY=<turnstile-site-key>
TURNSTILE_SECRET_KEY=<turnstile-secret-key>
```

> `.env` is git-ignored — secrets never get committed.

**Cloudflare Tunnel note:** if you expose the server via `cloudflared` instead of
opening ports 80/443, point the tunnel at the `caddy` container (or run Caddy in
`http` mode and let the tunnel terminate TLS). The backend already reads the real
visitor IP from the `CF-Connecting-IP` header that Cloudflare sets, so Turnstile
`remoteip` checks keep working behind the tunnel.

## 5. Launch

```sh
docker compose -f docker-compose.prod.yml up -d --build
```

First run: Caddy obtains a TLS certificate (needs DNS pointing at the server and
ports 80/443 reachable). After ~30–60s visit **https://yourdomain.com**.

## 6. Operate

```sh
# Status
docker compose -f docker-compose.prod.yml ps

# Logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f caddy

# Update to latest code
git pull
docker compose -f docker-compose.prod.yml up -d --build

# Stop / start
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

## 7. Backups (Postgres)

```sh
# Dump
docker compose -f docker-compose.prod.yml exec db \
  pg_dump -U postgres nearpoint > backup_$(date +%F).sql

# Restore
cat backup.sql | docker compose -f docker-compose.prod.yml exec -T db \
  psql -U postgres nearpoint
```

## Notes

- **Changing the Google Maps browser key or domain requires a frontend rebuild**
  (`--build`) because React embeds `REACT_APP_*` values at build time.
- The database is **not** exposed to the internet in the prod stack; only Caddy is.
- Data persists in the `pgdata` Docker volume across restarts.

## Local development

For a local run (no domain/TLS) use the plain compose file instead:

```sh
docker compose up -d --build
# frontend  -> http://localhost:3000
# backend   -> http://localhost:8070
# postgres  -> localhost:5433
```
