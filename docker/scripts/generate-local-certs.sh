#!/bin/bash

set -e

# Script to generate long-lived self-signed certificates for local development
# These certificates should be installed on developer machines to avoid browser warnings

CERT_DIR="${CERT_DIR:-../certs}"
DOMAIN="${DOMAIN:-catalystexplorer.local}"
VALIDITY_DAYS="${VALIDITY_DAYS:-3650}" # 10 years

echo "🔐 Generating long-lived self-signed certificates for local development"
echo "   Domain: ${DOMAIN}"
echo "   Validity: ${VALIDITY_DAYS} days ($(($VALIDITY_DAYS / 365)) years)"
echo ""

# Create certificate directory if it doesn't exist
mkdir -p "${CERT_DIR}"

# Generate configuration file for certificate
cat > "${CERT_DIR}/openssl.cnf" << EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
x509_extensions = v3_req
distinguished_name = dn

[dn]
C = US
ST = Development
L = Local
O = CatalystExplorer Development
OU = Engineering
emailAddress = dev@catalystexplorer.com
CN = ${DOMAIN}

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = ${DOMAIN}
DNS.2 = *.${DOMAIN}
DNS.3 = localhost
DNS.4 = *.localhost
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

# Generate private key
echo "📝 Generating private key..."
openssl genrsa -out "${CERT_DIR}/${DOMAIN}.key" 2048

# Generate certificate signing request
echo "📝 Generating certificate signing request..."
openssl req -new -key "${CERT_DIR}/${DOMAIN}.key" \
    -out "${CERT_DIR}/${DOMAIN}.csr" \
    -config "${CERT_DIR}/openssl.cnf"

# Generate self-signed certificate
echo "📝 Generating self-signed certificate..."
openssl x509 -req -days ${VALIDITY_DAYS} \
    -in "${CERT_DIR}/${DOMAIN}.csr" \
    -signkey "${CERT_DIR}/${DOMAIN}.key" \
    -out "${CERT_DIR}/${DOMAIN}.crt" \
    -extensions v3_req \
    -extfile "${CERT_DIR}/openssl.cnf"

# Set appropriate permissions
chmod 644 "${CERT_DIR}/${DOMAIN}.crt"
chmod 600 "${CERT_DIR}/${DOMAIN}.key"

echo ""
echo "✅ Certificate generation complete!"
echo ""
echo "📁 Files generated:"
echo "   Certificate: ${CERT_DIR}/${DOMAIN}.crt"
echo "   Private Key: ${CERT_DIR}/${DOMAIN}.key"
echo ""
echo "📋 Certificate Information:"
openssl x509 -in "${CERT_DIR}/${DOMAIN}.crt" -noout -dates -subject -issuer
echo ""
echo "🔧 Installation Instructions:"
echo ""
echo "macOS:"
echo "  1. Open Keychain Access"
echo "  2. File -> Import Items -> Select ${CERT_DIR}/${DOMAIN}.crt"
echo "  3. Double-click the imported certificate"
echo "  4. Expand 'Trust' section"
echo "  5. Set 'When using this certificate' to 'Always Trust'"
echo ""
echo "  OR run: sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${CERT_DIR}/${DOMAIN}.crt"
echo ""
echo "Linux (Ubuntu/Debian):"
echo "  sudo cp ${CERT_DIR}/${DOMAIN}.crt /usr/local/share/ca-certificates/"
echo "  sudo update-ca-certificates"
echo ""
echo "Firefox (all platforms):"
echo "  1. Preferences -> Privacy & Security -> Certificates -> View Certificates"
echo "  2. Servers tab -> Import"
echo "  3. Select ${CERT_DIR}/${DOMAIN}.crt"
echo "  4. Check 'Trust this CA to identify websites'"
echo ""
echo "⚠️  Remember to update your .env file with:"
echo "   CADDY_SERVER_SERVER_NAME=${DOMAIN}:443"
echo "   APP_URL=https://${DOMAIN}"
echo "   APP_SSL_PORT=443"
echo "   FRANKENPHP_PORT=443"
echo '   CADDY_SERVER_TLS_CONFIG="tls /etc/caddy/certs/'${DOMAIN}'.crt /etc/caddy/certs/'${DOMAIN}'.key"'
echo ""
echo "🔄 After installing the certificate, restart your Docker containers:"
echo "   make restart"
echo ""
