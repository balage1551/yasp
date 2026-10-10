#!/usr/bin/env bash
#
# Generates the self-signed certificate set the local backend and the Vite dev server need:
#
#   <name>.key   private key                  (Vite dev server)
#   <name>.crt   certificate                  (Vite dev server, trust store import)
#   <name>.p12   PKCS12 keystore of both      (Spring Boot ssl bundle "server")
#
# None of these are shared through git - every file written here is gitignored, so each
# checkout generates its own set. Sharing only the public half is not an option: the p12 and
# the crt have to belong to the key that sits next to them, so all three are regenerated
# together or not at all.
#
# Usage:
#   certs/generate-local-cert.sh [--force]
#
# Overridable through the environment:
#   CERT_DIR    target directory                 (default: <repo>/certs/localhost)
#   CERT_NAME   base name of the files           (default: localhost)
#   CERT_PASS   keystore password                (default: localhost)
#   CERT_ALIAS  key alias inside the keystore    (default: localhost)
#   CERT_DAYS   validity in days                 (default: 825)
#   CERT_SANS   comma separated subjectAltNames  (default: localhost, loopback, LAN address)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

CERT_DIR="${CERT_DIR:-$ROOT/certs/localhost}"
CERT_NAME="${CERT_NAME:-localhost}"
CERT_PASS="${CERT_PASS:-localhost}"
CERT_ALIAS="${CERT_ALIAS:-localhost}"
CERT_DAYS="${CERT_DAYS:-825}"
# The LAN address is the one other devices on the home network use to reach the dev servers.
CERT_SANS="${CERT_SANS:-DNS:localhost,IP:127.0.0.1,IP:::1,IP:192.168.1.16}"

FORCE=false
case "${1:-}" in
  --force) FORCE=true ;;
  '') ;;
  *) echo "Unknown argument: $1" >&2; echo "Usage: $0 [--force]" >&2; exit 2 ;;
esac

command -v openssl >/dev/null || { echo "openssl is not on PATH." >&2; exit 1; }

KEY="$CERT_DIR/$CERT_NAME.key"
CRT="$CERT_DIR/$CERT_NAME.crt"
P12="$CERT_DIR/$CERT_NAME.p12"
SSL_YAML="$ROOT/certs/application-local-ssl.yaml"

mkdir -p "$CERT_DIR"

if [[ "$FORCE" != true ]]; then
  for f in "$KEY" "$CRT" "$P12"; do
    if [[ -e "$f" ]]; then
      echo "$f already exists. Re-run with --force to replace the whole set." >&2
      exit 1
    fi
  done
fi

echo "Generating a $CERT_DAYS day self-signed certificate for $CERT_SANS"

# CA:TRUE keeps the certificate importable as a root, which is how the browsers are told to
# trust it; the SAN and the serverAuth usage are what they need to accept it as a server
# certificate in the first place.
openssl req -x509 -newkey rsa:4096 -sha256 -days "$CERT_DAYS" -noenc \
  -keyout "$KEY" -out "$CRT" \
  -subj "/CN=$CERT_NAME" \
  -addext "subjectAltName=$CERT_SANS" \
  -addext "basicConstraints=critical,CA:TRUE" \
  -addext "keyUsage=critical,digitalSignature,keyEncipherment,keyCertSign" \
  -addext "extendedKeyUsage=serverAuth" \
  2>/dev/null

chmod 600 "$KEY"

openssl pkcs12 -export -out "$P12" -inkey "$KEY" -in "$CRT" \
  -name "$CERT_ALIAS" -passout "pass:$CERT_PASS"

chmod 600 "$P12"

if [[ -e "$SSL_YAML" && "$FORCE" != true ]]; then
  echo
  echo "$SSL_YAML was left alone; check that it matches the alias and password above."
else
  cat > "$SSL_YAML" <<YAML
# Written by certs/generate-local-cert.sh - local only, never committed.
# application-local.yaml imports this by a relative path, so the backend has to run with the
# repository root as its working directory.
spring:
  ssl:
    bundle:
      jks:
        server:
          key:
            alias: "$CERT_ALIAS"
          keystore:
            location: "file:certs/${CERT_DIR##*/}/$CERT_NAME.p12"
            password: "$CERT_PASS"
            type: "PKCS12"
YAML
  echo "Wrote $SSL_YAML"
fi

echo
echo "Done:"
printf '  %s\n' "$KEY" "$CRT" "$P12"
echo
openssl x509 -in "$CRT" -noout -subject -dates -ext subjectAltName
echo
echo "The certificate is self-signed, so the browser warns until $CRT is imported as a"
echo "trusted authority. Both the backend (9810) and the Vite dev server (9811) use this set."
