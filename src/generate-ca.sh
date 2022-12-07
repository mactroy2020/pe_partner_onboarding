#/bin/sh

echo "Building CA\n=========="
docker run --rm -v $(pwd)/config/pki:/ca/pki-vol \
    partner-ca:latest /bin/bash \
    -c "/ca/easyrsa init-pki; cp -R /ca/pki/* /ca/pki-vol"

node src/generate-ca-config.js