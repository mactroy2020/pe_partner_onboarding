#/bin/sh

set -e 

cd /certs/ca

echo "\n\n=========================================="
echo "Create Signed Cert for hosting SSL service: $1"
echo "=========================================="

# Generate private key
openssl genrsa -out intermediate/private/$2_cert.key.pem 2048

# Create CSR
openssl req -config $3 \
      -key intermediate/private/$2_cert.key.pem \
      -new -sha256 -out intermediate/csr/$2_cert.csr.pem

# Sign cert
openssl ca -config $3 \
      -extensions server_cert -batch -days 375 -notext -md sha256 \
      -in intermediate/csr/$2_cert.csr.pem \
      -out intermediate/certs/$2_cert.cert.pem

echo "==============="
echo "Verify new cert"
echo "==============="
openssl x509 -noout -text \
      -in intermediate/certs/$2_cert.cert.pem

echo "==============="
echo "Verify new cert again CA chain"
echo "==============="
openssl verify -CAfile intermediate/certs/ca-chain.cert.pem \
      intermediate/certs/$2_cert.cert.pem

echo "\n\n==============="
echo "Copy cert + private key to tls directory: $1"
echo "==============="
cp intermediate/private/$2_cert.key.pem $1
cp intermediate/certs/$2_cert.cert.pem $1
cp /certs/ca-chain.cert.pem $1