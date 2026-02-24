# Claude Collective Frontend

Discover skills, MCP servers, prompts, jobs, and showcase projects. Everything you need to build with Claude.

![](./public/demo.png)

## Getting Started

### Prerequisites

Ensure you have Node.js 18.17.0+ installed. This project uses `npm` for package management.

### Running Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Production Deployment

### Architecture
- **Frontend**: Next.js in Docker on port `3000`
- **Domain**: `claudeai.directory` → nginx (host) → Next.js (port 3000)
- **API**: `https://api.claudeai.directory/api` (see `server/` repo)

### First-time setup
```bash
# 1. Copy env and fill in real values
cp .env.production .env
# Edit .env — set NEXT_PUBLIC_API_URL=https://api.claudeai.directory/api

# 2. Start the frontend container
docker compose up -d --build

# 3. Set up domain + SSL (requires DNS A record pointing to this server)
sudo bash setup-domain.sh
```

## Restart Commands (Production)

### After a code change or `.env` change
`NEXT_PUBLIC_*` vars are baked in at **build time** — always use `--build`:
```bash
docker compose up -d --build

docker compose --env-file .env.local up -d --build

```

### Restart without rebuilding
```bash
docker compose restart frontend
```

### Full stop and start
```bash
docker compose down
docker compose up -d
```

---
