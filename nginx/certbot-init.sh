#!/bin/bash
# Initial SSL certificate setup for claudeai.directory
# Run this ONCE on the server before starting the full stack.
#
# Prerequisites:
#   - Domain DNS A record pointing to this server's IP
#   - Ports 80 and 443 open in firewall
#
# Usage: ./nginx/certbot-init.sh

set -e

DOMAIN="claudeai.directory"
EMAIL="${CERTBOT_EMAIL:-admin@claudeai.directory}"

echo "==> Obtaining SSL certificate for $DOMAIN..."

docker run --rm \
  -v certbot_certs:/etc/letsencrypt \
  -v certbot_www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
    --standalone \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    -d "$DOMAIN"

echo "==> Certificate obtained successfully!"
echo "==> You can now start the full stack with: docker compose up -d"
