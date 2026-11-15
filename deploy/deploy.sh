#!/usr/bin/env bash
# Deploys one app image on the web server. Run as root by GitHub Actions through SSM
# Run Command, from /opt/lift4me, after CI has put docker-compose.yml, nginx.conf and
# this script there:
#
#   ./deploy.sh <full image URI, e.g. 0207….dkr.ecr.eu-central-1.amazonaws.com/lift4me:<git sha>>
#
# Steps: secrets + certificate from Parameter Store → ECR login → pull → test the nginx
# config → start → wait for the app's health check. If the new version doesn't become
# healthy, the previous image is started again and the script fails (so CI shows red).
set -euo pipefail

NEW_IMAGE="${1:?usage: deploy.sh <image uri>}"
REGION="eu-central-1"
PARAM_PATH="/lift4me/prod"
DIR="/opt/lift4me"
NGINX_IMAGE="nginx:1.28-alpine"
HEALTH_TIMEOUT=120

# SSM runs with a minimal PATH; the AWS CLI is a snap.
export PATH="/snap/bin:/usr/local/bin:/usr/bin:/bin"
cd "$DIR"
umask 077

log() { printf '[deploy %s] %s\n' "$(date -u +%H:%M:%S)" "$*"; }

# --- 1. Secrets and certificate ------------------------------------------------------
# Every /lift4me/prod/* parameter becomes a line in .env, except the certificate pair,
# which goes to certs/. Files are readable by root only (umask 077).
log "fetching configuration from Parameter Store"
# Piped, not redirected: the snap-packaged AWS CLI writes nothing (and still exits 0)
# when its stdout is a file opened by the shell, but works through a pipe.
aws ssm get-parameters-by-path --region "$REGION" --path "$PARAM_PATH" \
  --with-decryption --output json --query 'Parameters[].[Name,Value]' | cat > params.json
[[ -s params.json ]] || { echo "no parameters fetched from $PARAM_PATH" >&2; exit 1; }

mkdir -p certs
python3 - "$PARAM_PATH" <<'PY'
import json, sys
prefix = sys.argv[1] + "/"
params = dict(json.load(open("params.json")))
with open("certs/origin.pem", "w") as f:
    f.write(params.pop(prefix + "ORIGIN_CERT").strip() + "\n")
with open("certs/origin.key", "w") as f:
    f.write(params.pop(prefix + "ORIGIN_KEY").strip() + "\n")
with open("app.env", "w") as f:
    for name, value in sorted(params.items()):
        if "\n" in value:
            sys.exit(f"{name} must be a single line")
        f.write(f"{name.removeprefix(prefix)}={value}\n")
PY
rm -f params.json
chmod 0444 certs/origin.pem   # nginx's worker reads the certificate; the key stays 0600

PREVIOUS_IMAGE="$(cat current_image 2>/dev/null || true)"

write_env() {
  { cat app.env; echo "APP_IMAGE=$1"; } > .env
}

# --- 2. Image ------------------------------------------------------------------------
REGISTRY="${NEW_IMAGE%%/*}"
log "logging in to $REGISTRY"
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$REGISTRY" >/dev/null
log "pulling $NEW_IMAGE"
docker pull --quiet "$NEW_IMAGE"

# --- 3. Nginx config must be valid before anything is restarted ----------------------
log "testing nginx config"
docker run --rm --add-host app:127.0.0.1 \
  -v "$DIR/nginx.conf:/etc/nginx/conf.d/default.conf:ro" \
  -v "$DIR/certs:/certs:ro" \
  "$NGINX_IMAGE" nginx -t -q

# --- 4. Start and wait for health ----------------------------------------------------
wait_healthy() {
  local id status deadline=$((SECONDS + HEALTH_TIMEOUT))
  id="$(docker compose ps -q app)"
  while (( SECONDS < deadline )); do
    status="$(docker inspect -f '{{.State.Health.Status}}' "$id" 2>/dev/null || echo missing)"
    [[ "$status" == "healthy" ]] && return 0
    sleep 3
  done
  return 1
}

log "starting $NEW_IMAGE"
write_env "$NEW_IMAGE"
docker compose up -d --remove-orphans

if wait_healthy; then
  # A changed nginx.conf is a bind mount, so compose won't restart nginx for it.
  docker compose exec -T nginx nginx -s reload || docker compose restart nginx
  echo "$NEW_IMAGE" > current_image
  [[ -n "$PREVIOUS_IMAGE" && "$PREVIOUS_IMAGE" != "$NEW_IMAGE" ]] && echo "$PREVIOUS_IMAGE" > previous_image
  # Free disk: drop images unused for a week (the previous one stays for rollback).
  docker image prune -af --filter "until=168h" >/dev/null || true
  log "deployed $NEW_IMAGE"
  exit 0
fi

log "new version did not become healthy — last app logs:"
docker compose logs --tail 40 app || true
if [[ -n "$PREVIOUS_IMAGE" ]]; then
  log "rolling back to $PREVIOUS_IMAGE"
  write_env "$PREVIOUS_IMAGE"
  docker compose up -d --remove-orphans
  wait_healthy && log "rollback healthy" || log "rollback ALSO unhealthy — check the server"
fi
exit 1
