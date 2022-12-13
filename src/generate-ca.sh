#!/bin/sh

echo "Generating Local Certificate Authority"

# Create directories for CA
mkdir -p /certs/ca
cd /certs/ca
mkdir -p certs crl newcerts private
touch index.txt
echo 1000 > serial

cp /ca/config/rootca_openssl.cnf /certs/ca/openssl.cnf
openssl genrsa -out private/ca.key.pem 4096

# Create the root certificate
openssl req -config openssl.cnf \
      -key private/ca.key.pem \
      -new -x509 -days 7300 -sha256 -extensions v3_ca \
      -out certs/ca.cert.pem

echo "==============="
echo "Verify Root CA"
echo "==============="
openssl x509 -noout -text -in certs/ca.cert.pem

echo "\n\n=========================================="
echo "Generating Local Intermediate Certificate Authority"
echo "=========================================="
mkdir -p /certs/ca/intermediate
cd /certs/ca/intermediate

mkdir -p certs crl csr newcerts private
touch index.txt
echo 1000 > serial

# crlnumber is used to keep track of certificate revocation lists.
echo 1000 > crlnumber

cp /ca/config/intermediateca_openssl.cnf /certs/ca/intermediate/openssl.cnf

cd ..
openssl genrsa -out intermediate/private/intermediate.key.pem 4096
openssl req -config intermediate/openssl.cnf -new -sha256 \
      -key intermediate/private/intermediate.key.pem \
      -out intermediate/csr/intermediate.csr.pem

openssl ca -config openssl.cnf -extensions v3_intermediate_ca \
      -days 3650 -batch -notext -md sha256 \
      -in intermediate/csr/intermediate.csr.pem \
      -out intermediate/certs/intermediate.cert.pem

openssl x509 -noout -text -in certs/ca.cert.pem
echo "\n==============="
echo "Verify Intermediate CA"
echo "==============="
openssl x509 -noout -text \
      -in intermediate/certs/intermediate.cert.pem

echo "\n==============="
echo "Verify Intermediate CA against Root CA"
echo "==============="
openssl verify -CAfile certs/ca.cert.pem \
      intermediate/certs/intermediate.cert.pem

echo "\nCreate CA Chain"
cat intermediate/certs/intermediate.cert.pem \
      certs/ca.cert.pem > intermediate/certs/ca-chain.cert.pem

cp intermediate/certs/ca-chain.cert.pem /certs/ca-chain.cert.pem

echo "\n\n=========================================="
echo "Create Signed Cert for hosting SSL service"
echo "=========================================="

# Generate private key
openssl genrsa -out intermediate/private/service_cert.key.pem 2048

# Create CSR
openssl req -config intermediate/openssl.cnf \
      -key intermediate/private/service_cert.key.pem \
      -new -sha256 -out intermediate/csr/service_cert.csr.pem

# Sign cert
openssl ca -config intermediate/openssl.cnf \
      -extensions server_cert -batch -days 375 -notext -md sha256 \
      -in intermediate/csr/service_cert.csr.pem \
      -out intermediate/certs/service_cert.cert.pem

echo "==============="
echo "Verify new cert"
echo "==============="
openssl x509 -noout -text \
      -in intermediate/certs/service_cert.cert.pem

echo "==============="
echo "Verify new cert again CA chain"
echo "==============="
openssl verify -CAfile intermediate/certs/ca-chain.cert.pem \
      intermediate/certs/service_cert.cert.pem
