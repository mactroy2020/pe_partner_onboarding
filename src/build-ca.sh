#/bin/sh

# exit when any command fails
set -e

echo "Building Local Certificate Authority\n=========="

# Create the base directory for storing generated certs + ca
mkdir -p certs

# Generate the configuration files for project
node src/generate-project-config.js

# Generate the Root + Intermediate Certificate Authority
docker run --rm \
    -v $(pwd)/certs:/certs \
    -v $(pwd)/src:/ca/scripts \
    -v $(pwd)/config:/ca/config \
    partner-ca:latest /bin/bash \
    -c "sh /ca/scripts/generate-ca.sh"
