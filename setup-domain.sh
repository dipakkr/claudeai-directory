#!/bin/bash
# =============================================================
# setup-domain.sh
# Configures nginx behind Cloudflare for claudeai.directory
# Proxies traffic → Next.js app running in Docker on port 3001
#
# SSL is handled by Cloudflare (edge termination).
# Optionally supports Cloudflare Origin Certificates for
# Full (Strict) mode — see step 7 below.
#
# Usage:
#   sudo bash setup-domain.sh
#
# Prerequisites:
#   - Ubuntu/Debian server
#   - DNS A record: claudeai.directory → this server's IP (proxied via Cloudflare)
#   - Next.js app already running: docker compose up -d
# =============================================================

set -euo pipefail

DOMAIN="claudeai.directory"
APP_PORT="3001"
NGINX_CONF="/etc/nginx/sites-available/${DOMAIN}"

# Cloudflare Origin Certificate paths (optional, for Full Strict mode)
ORIGIN_CERT="/etc/ssl/cloudflare/${DOMAIN}/cert.pem"
ORIGIN_KEY="/etc/ssl/cloudflare/${DOMAIN}/key.pem"

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
echo -e "${BLUE}  Domain setup: ${DOMAIN} (Cloudflare SSL)${NC}"
echo -e "${BLUE}====================================================${NC}"
echo ""

# ---- 1. Must run as root ----
[[ $EUID -ne 0 ]] && fail "Run as root: sudo bash setup-domain.sh"

# ---- 2. Install required packages ----
log "Installing nginx and tools..."
apt-get update -qq
apt-get install -y -qq nginx dnsutils curl ufw
log "Packages installed"

# ---- 3. Verify app is running on port $APP_PORT ----
log "Checking Next.js app on port ${APP_PORT}..."
if ! curl -sf --max-time 5 "http://127.0.0.1:${APP_PORT}" > /dev/null 2>&1; then
    fail "App is not responding on 127.0.0.1:${APP_PORT}. Start it first:
    cd /path/to/project && docker compose up -d"
fi
log "App is up on port ${APP_PORT}"

# ---- 4. Check DNS resolves ----
log "Checking DNS for ${DOMAIN}..."
SERVER_IP=$(curl -sf --max-time 5 https://api.ipify.org || curl -sf --max-time 5 https://ipinfo.io/ip)
DOMAIN_IP=$(dig +short "${DOMAIN}" A | tail -1)

if [[ -z "$DOMAIN_IP" ]]; then
    fail "DNS lookup for ${DOMAIN} returned nothing. Add an A record and wait for propagation."
fi

# Note: With Cloudflare proxy enabled, DOMAIN_IP will be a Cloudflare IP, not your server IP.
# That's expected — we just check that DNS resolves at all.
if [[ "$DOMAIN_IP" == "$SERVER_IP" ]]; then
    log "DNS OK: ${DOMAIN} → ${DOMAIN_IP} (direct, not proxied via Cloudflare)"
    warn "Consider enabling Cloudflare proxy (orange cloud) for SSL and DDoS protection."
else
    log "DNS OK: ${DOMAIN} → ${DOMAIN_IP} (likely proxied via Cloudflare)"
fi

# ---- 5. Open firewall ports ----
log "Opening firewall ports 80 and 443..."
ufw allow 80/tcp  > /dev/null 2>&1 || true
ufw allow 443/tcp > /dev/null 2>&1 || true

# ---- 6. Check for Cloudflare Origin Certificate ----
HAS_ORIGIN_CERT=false
if [[ -f "$ORIGIN_CERT" && -f "$ORIGIN_KEY" ]]; then
    HAS_ORIGIN_CERT=true
    log "Cloudflare Origin Certificate found — configuring Full (Strict) SSL"
else
    info "No Origin Certificate found at ${ORIGIN_CERT}"
    info "Using HTTP-only mode (Cloudflare Flexible/Full SSL)"
    info ""
    info "To upgrade to Full (Strict) mode later:"
    info "  1. Go to Cloudflare Dashboard → SSL/TLS → Origin Server"
    info "  2. Create an Origin Certificate"
    info "  3. Save cert.pem and key.pem to /etc/ssl/cloudflare/${DOMAIN}/"
    info "  4. Re-run this script"
    echo ""
fi

# ---- 7. Deploy nginx config ----
if [[ "$HAS_ORIGIN_CERT" == true ]]; then
    log "Writing nginx config with Cloudflare Origin Certificate..."
    cat > "${NGINX_CONF}" << EOF
# HTTP → HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    location / {
        return 301 https://\$host\$request_uri;
    }
}

# HTTPS — Cloudflare Origin Certificate
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};

    # Cloudflare Origin Certificate
    ssl_certificate     ${ORIGIN_CERT};
    ssl_certificate_key ${ORIGIN_KEY};

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # Security headers
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;

    # Only accept traffic from Cloudflare (optional hardening)
    # See: https://www.cloudflare.com/ips/

    # Proxy all requests to Next.js
    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        # WebSocket support
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
else
    log "Writing nginx config (HTTP-only, Cloudflare handles SSL)..."
    cat > "${NGINX_CONF}" << EOF
# HTTP server — Cloudflare terminates SSL at the edge
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Security headers
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
        # WebSocket support
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
fi

# Disable the default site, enable ours
rm -f /etc/nginx/sites-enabled/default
ln -sf "${NGINX_CONF}" "/etc/nginx/sites-enabled/${DOMAIN}"

nginx -t || fail "Nginx config test failed"
systemctl restart nginx
log "Nginx is running"

# ---- Done ----
echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}  Setup complete!${NC}"
echo -e "${GREEN}${NC}"
echo -e "${GREEN}  https://${DOMAIN}${NC}"
echo -e "${GREEN}${NC}"
if [[ "$HAS_ORIGIN_CERT" == true ]]; then
echo -e "${GREEN}  - SSL mode: Full (Strict) via Cloudflare Origin Cert${NC}"
echo -e "${GREEN}  - Origin cert: no renewal needed (15-year validity)${NC}"
else
echo -e "${GREEN}  - SSL mode: Flexible/Full (Cloudflare edge)${NC}"
echo -e "${GREEN}  - Set Cloudflare SSL mode to 'Full' in dashboard${NC}"
fi
echo -e "${GREEN}  - Next.js app proxied from port ${APP_PORT}${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
