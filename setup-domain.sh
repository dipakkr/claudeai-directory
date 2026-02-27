#!/bin/bash
# =============================================================
# setup-domain.sh
# Configures nginx + Let's Encrypt SSL for claudeai.directory
# Proxies HTTPS → Next.js app running in Docker on port 3000
#
# Usage:
#   sudo bash setup-domain.sh
#
# Prerequisites:
#   - Ubuntu/Debian server
#   - DNS A record: claudeai.directory → this server's IP
#   - Next.js app already running: docker compose up -d
# =============================================================

set -euo pipefail

DOMAIN="claudeai.directory"
EMAIL="${CERTBOT_EMAIL:-}"
APP_PORT="3000"
NGINX_CONF="/etc/nginx/sites-available/${DOMAIN}"
CERTBOT_WEBROOT="/var/www/certbot"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[+]${NC} $*"; }
info() { echo -e "${BLUE}[i]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
fail() { echo -e "${RED}[x]${NC} $*"; exit 1; }

echo ""
echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}  Domain setup: ${DOMAIN}${NC}"
echo -e "${BLUE}====================================================${NC}"
echo ""

# ---- 1. Must run as root ----
[[ $EUID -ne 0 ]] && fail "Run as root: sudo bash setup-domain.sh"
[[ -z "$EMAIL" ]] && fail "Set CERTBOT_EMAIL before running: CERTBOT_EMAIL=you@example.com sudo bash setup-domain.sh"

# ---- 2. Install required packages ----
log "Installing nginx, certbot, and tools..."
apt-get update -qq
apt-get install -y -qq nginx certbot python3-certbot-nginx dnsutils curl ufw
log "Packages installed"

# ---- 3. Verify app is running on port $APP_PORT ----
log "Checking Next.js app on port ${APP_PORT}..."
if ! curl -sf --max-time 5 "http://127.0.0.1:${APP_PORT}" > /dev/null 2>&1; then
    fail "App is not responding on 127.0.0.1:${APP_PORT}. Start it first:
    cd /path/to/project && docker compose up -d"
fi
log "App is up on port ${APP_PORT}"

# ---- 4. Check DNS resolves to this server ----
log "Checking DNS for ${DOMAIN}..."
SERVER_IP=$(curl -sf --max-time 5 https://api.ipify.org || curl -sf --max-time 5 https://ipinfo.io/ip)
DOMAIN_IP=$(dig +short "${DOMAIN}" A | tail -1)

if [[ -z "$DOMAIN_IP" ]]; then
    fail "DNS lookup for ${DOMAIN} returned nothing. Add an A record pointing to ${SERVER_IP} and wait for propagation."
fi

if [[ "$DOMAIN_IP" != "$SERVER_IP" ]]; then
    warn "DNS mismatch: ${DOMAIN} → ${DOMAIN_IP}, but this server is ${SERVER_IP}"
    warn "Certbot will fail if DNS is not pointing here."
    read -rp "Continue anyway? (y/N): " reply
    [[ "$reply" =~ ^[Yy]$ ]] || exit 1
else
    log "DNS OK: ${DOMAIN} → ${DOMAIN_IP}"
fi

# Check if www subdomain also points here (optional, but include in cert if so)
WWW_IP=$(dig +short "www.${DOMAIN}" A | tail -1)
EXTRA_DOMAINS=""
if [[ "$WWW_IP" == "$SERVER_IP" ]]; then
    log "www.${DOMAIN} also points here — will include in certificate"
    EXTRA_DOMAINS="-d www.${DOMAIN}"
else
    warn "www.${DOMAIN} does not point to this server (${WWW_IP:-not set}) — skipping from cert"
fi

# ---- 5. Open firewall ports ----
log "Opening firewall ports 80 and 443..."
ufw allow 80/tcp  > /dev/null 2>&1 || true
ufw allow 443/tcp > /dev/null 2>&1 || true

# ---- 6. Certbot webroot directory ----
mkdir -p "${CERTBOT_WEBROOT}"

# ---- 7. Deploy HTTP-only nginx config (needed for certbot ACME challenge) ----
log "Writing temporary HTTP nginx config for certbot verification..."
cat > "${NGINX_CONF}" << EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Let's Encrypt ACME challenge
    location /.well-known/acme-challenge/ {
        root ${CERTBOT_WEBROOT};
    }

    # Proxy to app while we wait for the cert
    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

# Disable the default site, enable ours
rm -f /etc/nginx/sites-enabled/default
ln -sf "${NGINX_CONF}" "/etc/nginx/sites-enabled/${DOMAIN}"

nginx -t || fail "Nginx HTTP config test failed"
systemctl restart nginx
log "Nginx running (HTTP only)"

# ---- 8. Obtain SSL certificate ----
log "Obtaining SSL certificate from Let's Encrypt..."
# shellcheck disable=SC2086
certbot certonly \
    --webroot \
    --webroot-path "${CERTBOT_WEBROOT}" \
    -d "${DOMAIN}" \
    ${EXTRA_DOMAINS} \
    --email "${EMAIL}" \
    --agree-tos \
    --no-eff-email \
    --non-interactive

log "SSL certificate obtained: /etc/letsencrypt/live/${DOMAIN}/"

# ---- 9. Deploy full HTTPS nginx config ----
log "Writing HTTPS nginx config..."

if [[ -n "$EXTRA_DOMAINS" ]]; then
cat > "${NGINX_CONF}" << EOF
# HTTP → HTTPS (www) redirect
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Keep ACME challenge working for renewals
    location /.well-known/acme-challenge/ {
        root ${CERTBOT_WEBROOT};
    }

    location / {
        return 301 https://www.${DOMAIN}\$request_uri;
    }
}

# HTTPS (non-www) → HTTPS (www) redirect
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN};

    ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    location / {
        return 301 https://www.${DOMAIN}\$request_uri;
    }
}

# HTTPS Main Site (www)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.${DOMAIN};
EOF
else
cat > "${NGINX_CONF}" << EOF
# HTTP → HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    # Keep ACME challenge working for renewals
    location /.well-known/acme-challenge/ {
        root ${CERTBOT_WEBROOT};
    }

    location / {
        return 301 https://${DOMAIN}\$request_uri;
    }
}

# HTTPS Main Site
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN};
EOF
fi

cat >> "${NGINX_CONF}" << EOF
    # Let's Encrypt certificates
    ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    # Strong SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;

    # Proxy all requests to Next.js
    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        # WebSocket support (Next.js SSE / hot reload compatibility)
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 60s;
    }

    # Cache Next.js static assets (immutable, fingerprinted filenames)
    location /_next/static/ {
        proxy_pass http://127.0.0.1:${APP_PORT};
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
EOF

nginx -t || fail "Nginx HTTPS config test failed"
systemctl reload nginx
log "Nginx running with HTTPS"

# ---- 10. Auto-renewal via systemd timer ----
log "Enabling certbot auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

# Verify the renewal config works
log "Running certbot renewal dry-run..."
certbot renew --dry-run --quiet && log "Auto-renewal dry-run passed"

# ---- Done ----
echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}  Setup complete!${NC}"
echo -e "${GREEN}${NC}"
echo -e "${GREEN}  https://${DOMAIN}${NC}"
echo -e "${GREEN}${NC}"
echo -e "${GREEN}  - HTTP  → HTTPS redirect: enabled${NC}"
echo -e "${GREEN}  - SSL cert auto-renews every 90 days${NC}"
echo -e "${GREEN}  - Next.js app proxied from port ${APP_PORT}${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
