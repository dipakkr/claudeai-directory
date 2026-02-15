#!/bin/bash
# Deploy claudeai.directory to Hetzner VPS
#
# Usage:
#   First time:  ./deploy.sh init
#   Update:      ./deploy.sh
#   Seed DB:     ./deploy.sh seed

set -e

# Load env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

case "${1:-deploy}" in
  init)
    echo "==> First-time setup"
    echo ""
    echo "1. Install Docker on your Hetzner VPS:"
    echo "   curl -fsSL https://get.docker.com | sh"
    echo ""
    echo "2. Clone the repo and cd into it"
    echo ""
    echo "3. Copy and fill in environment files:"
    echo "   cp .env.production .env"
    echo "   cp server/.env.example server/.env  # (or create server/.env)"
    echo "   # Edit both files with real values"
    echo ""
    echo "4. Get SSL certificate:"
    echo "   ./nginx/certbot-init.sh"
    echo ""
    echo "5. Start the stack:"
    echo "   docker compose up -d --build"
    echo ""
    echo "6. Seed the database (optional):"
    echo "   ./deploy.sh seed"
    ;;

  seed)
    echo "==> Seeding database..."
    docker compose exec api python -m app.seed.seed_data
    echo "==> Done!"
    ;;

  deploy|"")
    echo "==> Building and deploying..."
    docker compose build --parallel
    docker compose up -d
    echo ""
    echo "==> Deployment complete. Checking status..."
    docker compose ps
    ;;

  logs)
    docker compose logs -f --tail=100 "${2:-}"
    ;;

  *)
    echo "Usage: ./deploy.sh [init|deploy|seed|logs [service]]"
    ;;
esac
