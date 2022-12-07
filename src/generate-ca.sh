#/bin/sh

echo "Building CA\n=========="
mkdir -p certs/pki
docker run --rm -v $(pwd)/certs/pki:/ca/pki-vol \
    partner-ca:latest /bin/bash \
    -c "/ca/easyrsa init-pki; cp -R /ca/pki/* /ca/pki-vol"

node src/generate-ca-config.js