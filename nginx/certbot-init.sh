#!/bin/bash
# Initial SSL certificate setup for claudeai.directory
# Run this ONCE on the server before starting the full stack.
#
# Prerequisites:
#   - Domain DNS A/AAAA record pointing to this server's IP
#   - Ports 80 and 443 open in firewall
#
# Usage: ./nginx/certbot-init.sh

set -e

DOMAIN="claudeai.directory"
EMAIL="${CERTBOT_EMAIL:-admin@claudeai.directory}"

echo "==> Obtaining SSL certificate for $DOMAIN..."

# 1. Stop components that might be holding port 80
echo "==> Stopping existing services to free port 80..."
docker compose down || true

# 2. Use 'docker compose run' mapped to port 80 so it shares the SAME volume names as docker-compose
docker compose run --rm -p 80:80 certbot certonly \
    --standalone \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    -d "$DOMAIN"

echo "==> Certificate obtained successfully!"
echo "==> You can now start the full stack with:"
echo "    docker compose up -d --build"

