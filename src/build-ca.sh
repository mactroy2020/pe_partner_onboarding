#/bin/sh

echo "Building Local Certificate Authority\n=========="
mkdir -p certs
# docker run --rm -v $(pwd)/certs/pki:/ca/pki-vol \
#     partner-ca:latest /bin/bash \
#     -c "/ca/easyrsa init-pki; cp -R /ca/pki/* /ca/pki-vol;"


node src/generate-ca-config.js

docker run --rm -v $(pwd)/certs:/certs -v $(pwd)/src:/ca/scripts -v $(pwd)/config:/ca/config \
    partner-ca:latest /bin/bash \
    -c "sh /ca/scripts/generate-ca-v2.sh"
