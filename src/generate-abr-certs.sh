#/bin/sh

echo "Generating Encryption Keys"
openssl ecparam -name prime256v1 -genkey -noout -out /certs/encryption-key.pem
openssl req -config /ca/config/openssl.cfg  -new -key /certs/encryption-key.pem -out /certs/encryption.csr

echo "Generating Server Keys"
openssl genrsa -out /certs/server-key.pem 4096
openssl req -new -config /ca/config/openssl.cfg -key /certs/server-key.pem -out /certs/server.csr

echo "Generating Client Keys"
openssl genrsa -out /certs/client-key.pem 2048
openssl req -new -config /ca/config/openssl.cfg -key /certs/client-key.pem -out /certs/client.csr

echo "Done"