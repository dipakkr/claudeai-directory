# Deployment

Both services are **self-hosted on a single Hetzner VPS**, in Docker, behind
nginx and Cloudflare. There is no Vercel, and pushing to GitHub does not deploy
anything — a person has to pull and rebuild on the box.

| Piece | Host | Public URL | Container |
|---|---|---|---|
| Frontend (Next.js) | VPS, port 3001 | https://claudeai.directory | `claudeai-directory-frontend-1` |
| API (FastAPI) | VPS, port 8000 | https://api.claudeai.directory | `claudeai-bff-api-1` |
| Redis | VPS, port 6379 | internal | `claudeai-bff-redis-1` |
| MongoDB | **MongoDB Atlas** (`cluster0.qwhpkcy`) | — | managed |

SSH alias: `tooljunction` (`azureuser@52.165.80.178`).

Checkouts on the server:

- Frontend — `/home/azureuser/claudeai-dir/claudeai-directory`
- API — `/home/azureuser/claudeai-dir/claudeai-bff`

---

## Deploy the frontend

```bash
ssh tooljunction
cd /home/azureuser/claudeai-dir/claudeai-directory
git pull --ff-only
docker compose up -d --build
```

Takes a few minutes; the Next.js build runs inside the image. Verify with a
string only the new build contains, rather than trusting the container status:

```bash
curl -s https://claudeai.directory/ | grep -c 'Discord is open'
```

## Deploy the API

```bash
ssh tooljunction
cd /home/azureuser/claudeai-dir/claudeai-bff
git pull --ff-only
docker compose -f docker-compose.prod.yml up -d --build api
curl -s https://api.claudeai.directory/api/health   # {"status":"ok","mongo":true,"redis":true}
```

`docker-compose.prod.yml` uses `network_mode: host`, which is why `.env` points
at `localhost:6379` for Redis rather than a service name.

---

## Database — read this before running any script

**`backend/.env` points at production Atlas.** Every seed, backfill, or
migration run from a local checkout writes to the **live database**, including
from your laptop. There is no local sandbox unless you deliberately create one.

Before running anything that writes, confirm where it will land:

```bash
cd backend && .venv/bin/python -c "
import os; from dotenv import load_dotenv; load_dotenv()
print(os.environ['MONGO_URL'].split('@')[-1].split('/')[0])"
```

To work against a local database instead, point `MONGO_URL` at the local
container (`mongodb://claudehq:<pass>@localhost:27017/claude_collective?authSource=admin`)
and keep the Atlas string in a separate `.env.production` you opt into.

Seeds and backfills are idempotent (upsert on a stable `_id`) and safe to
re-run, but they still run against prod by default.

## Caching

The API caches most collections in Redis for 5–10 minutes. After a seed or a
direct database change, the public API keeps serving stale data until the TTL
expires. That is normal — do not assume the write failed.

## Frontend environment

Server-side reads prefer `API_INTERNAL_URL` (origin only, without `/api`).
Docker Compose sets it to `http://host.docker.internal:8000`, reaching the API
through the host gateway. Browser requests still use `NEXT_PUBLIC_API_URL`.
If the API moves off this host, update the internal URL accordingly.

Published skill detail pages are pre-rendered at build time and revalidated every
five minutes. The skills list remains server-rendered per request to preserve
query-specific filtering and noindex metadata, with cached API data. Rankings
have a 1.5-second budget before falling back to the existing catalog ordering.
An API outage must show a retry state, never an apparently empty skill catalog.

`fe/.env.development.local` currently points local dev at the **production**
API, so `npm run dev` reads and writes live data. `fe/.env.local` also holds the
production URL. To develop against a local API, set
`NEXT_PUBLIC_API_URL=http://localhost:8000/api` in `.env.development.local`
(it takes precedence over `.env.local` in dev) and restart the dev server.

## Rollback

```bash
ssh tooljunction
cd /home/azureuser/claudeai-dir/claudeai-directory
git log --oneline -5
git checkout <previous-sha>
docker compose up -d --build
```

## Required release workflow for coding agents

When the user authorizes deployment, deploy all related frontend and backend changes end to end; do not stop after pushing. Do not ask for the host again: use `ssh tooljunction` and the checkouts above.

1. Review local changes in both repos, preserve unrelated work, and run targeted frontend ESLint, a production build, and `cd backend && .venv/bin/python -m pytest tests -q`.
2. Commit the reviewed release in each repository and push to GitHub `main` (fetch first; never force-push). Feature branches may push `HEAD:main` only when main is an ancestor.
3. On the server, inspect git status before pulling. Save existing source edits in a dated backup/stash, compare them with the release, and preserve any non-superseded changes. Never overwrite `.env`, databases, or Docker volumes.
4. Pull with `git pull --ff-only origin main` in both production checkouts.
5. Build images before replacing containers. Keep the previous image IDs for rollback. Start API with `docker compose -f docker-compose.prod.yml up -d --no-deps api`, then frontend with `docker compose up -d --no-deps frontend`.
6. Verify API health, sponsor checkout configuration ($40/week), homepage/feed/launches, advertising UI, and logs. Confirm production uses the real API, not local preview payments. Public sample email previews are excluded by `.dockerignore`.
7. Record GitHub commit IDs, deployed container IDs, checks and any remaining limitations. If sponsored-ad admin UI changes are involved, also release the specific CAD sponsor changes in `dipakkr/tj-admin` (separate hosted admin).

### Email runtime configuration

Backend only: `RESEND_API_KEY`, `EMAIL_FROM=Claude AI Community <community@claudeai.directory>`, `ADMIN_DIGEST_EMAIL=hello@claudeai.directory`.
`ONBOARDING_EMAILS_ENABLED=true` enables enrollment of *new* signups only, sending welcome at 4 minutes, launches at 6 hours, follow-up at 4 days. Content is queried live at first send; retries freeze the same payload/idempotency key. User/subscriber opt-outs are respected; no old-user backfill. The weekly digest and daily admin digest retain their separate settings.
Never log or commit credentials. Transfer only specifically needed secret values through a protected stdin channel, preserving other remote configuration.
