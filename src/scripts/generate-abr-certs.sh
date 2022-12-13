#/bin/sh

set -e

echo "Generating ABR Encryption CSR + Keys"
openssl ecparam -name prime256v1 -genkey -noout -out $1/encryption-key.pem
openssl req -config $2 -new -key $1/encryption-key.pem -out $1/encryption.csr

echo "Generating ABR TLS Server CSR + Keys"
openssl genrsa -out $1/server-key.pem 4096
openssl req -new -config $2 -key $1/server-key.pem -out $1/server.csr

echo "Generating ABR TLS Client CSR + Keys"
openssl genrsa -out $1/client-key.pem 2048
openssl req -new -config $2 -key $1/client-key.pem -out $1/client.csr

echo "Done"