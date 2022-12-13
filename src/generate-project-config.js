const fs = require("fs");

const projectConfigFile = require(__dirname + "/../config/config.json");

generateRootCAConfig({
    ...projectConfigFile.defaultConfig,
    ...projectConfigFile.ca,
});
generateIntermediateCAConfig({
    ...projectConfigFile.defaultConfig,
    ...projectConfigFile.ca,
});

/*====================
Generate all of the ABR Environment CSR Configs
====================*/
if (projectConfigFile.abr_env && projectConfigFile.abr_env.length > 0) {
    projectConfigFile.abr_env.map((hostConfig) => {
        generateSignedTLSConfigs("abr", {
            ...projectConfigFile.defaultConfig,
            ...hostConfig,
        });
    });
}

/*====================
Generate all of the TLS Environment CSR Configs for Signing
====================*/
if (projectConfigFile.host_tls && projectConfigFile.host_tls.length > 0) {
    projectConfigFile.host_tls.map((hostConfig) => {
        generateSignedTLSConfigs("tls", {
            ...projectConfigFile.defaultConfig,
            ...hostConfig,
        });
    });
}

function generateRootCAConfig(rootCAConfig) {
    console.log(JSON.stringify(rootCAConfig, null, 4));
    console.log("Generating OpenSSL Root CA cert config using configuration:");

    let rootCAConfigTemplate = `
# Reference: https://jamielinux.com/docs/openssl-certificate-authority/create-the-root-pair.html

[ ca ]
# \`man ca\`
default_ca = CA_default

[ CA_default ]
# Directory and file locations.
dir               = /certs/ca
certs             = $dir/certs
crl_dir           = $dir/crl
new_certs_dir     = $dir/newcerts
database          = $dir/index.txt
serial            = $dir/serial
RANDFILE          = $dir/private/.rand

# The root key and root certificate.
private_key       = $dir/private/ca.key.pem
certificate       = $dir/certs/ca.cert.pem

# For certificate revocation lists.
crlnumber         = $dir/crlnumber
crl               = $dir/crl/ca.crl.pem
crl_extensions    = crl_ext
default_crl_days  = 30

# SHA-1 is deprecated, so use SHA-2 instead.
default_md        = sha256

name_opt          = ca_default
cert_opt          = ca_default
default_days      = 375
preserve          = no
policy            = policy_strict

[ policy_strict ]
# The root CA should only sign intermediate certificates that match.
# See the POLICY FORMAT section of \`man ca\`.
countryName             = match
stateOrProvinceName     = match
organizationName        = match
organizationalUnitName  = optional
commonName              = supplied
emailAddress            = optional

[ policy_loose ]
# Allow the intermediate CA to sign a more diverse range of certificates.
# See the POLICY FORMAT section of the \`ca\` man page.
countryName             = optional
stateOrProvinceName     = optional
localityName            = optional
organizationName        = optional
organizationalUnitName  = optional
commonName              = supplied
emailAddress            = optional

[ req ]
# Options for the \`req\` tool (\`man req\`).
default_bits        = 2048
distinguished_name  = req_distinguished_name
string_mask         = utf8only
prompt              = no

# SHA-1 is deprecated, so use SHA-2 instead.
default_md          = sha256

# Extension to add when the -x509 option is used.
x509_extensions     = v3_ca

[ req_distinguished_name ]
# See <https://en.wikipedia.org/wiki/Certificate_signing_request>.

countryName            = ${rootCAConfig.country}
stateOrProvinceName    = ${rootCAConfig.state}
localityName           = ${rootCAConfig.city}
organizationName       = ${rootCAConfig.company}
organizationalUnitName = Certificate Authority
commonName             = ${rootCAConfig.host}
emailAddress           = ${rootCAConfig.email}

[ v3_ca ]
# Extensions for a typical CA (\`man x509v3_config\`).
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical, CA:true
keyUsage = critical, digitalSignature, cRLSign, keyCertSign

[ v3_intermediate_ca ]
# Extensions for a typical intermediate CA (\`man x509v3_config\`).
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical, CA:true, pathlen:0
keyUsage = critical, digitalSignature, cRLSign, keyCertSign

[ usr_cert ]
# Extensions for client certificates (\`man x509v3_config\`).
basicConstraints = CA:FALSE
nsCertType = client, email
nsComment = "OpenSSL Generated Client Certificate"
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer
keyUsage = critical, nonRepudiation, digitalSignature, keyEncipherment
extendedKeyUsage = clientAuth, emailProtection

[ server_cert ]
# Extensions for server certificates (\`man x509v3_config\`).
basicConstraints = CA:FALSE
nsCertType = server
nsComment = "OpenSSL Generated Server Certificate"
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer:always
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth

[ crl_ext ]
# Extension for CRLs (\`man x509v3_config\`).
authorityKeyIdentifier=keyid:always

[ ocsp ]
# Extension for OCSP signing certificates (\`man ocsp\`).
basicConstraints = CA:FALSE
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer
keyUsage = critical, digitalSignature
extendedKeyUsage = critical, OCSPSigning
`;

    // console.log("\nOpenSSL Config File:");
    // console.log(rootCAConfigTemplate);
    fs.writeFileSync(
        __dirname + "/../config/generated/rootca_openssl.cnf",
        rootCAConfigTemplate,
        {
            encoding: "utf8",
        }
    );
}

function generateIntermediateCAConfig(intermediateCAConfig) {
    console.log(
        "Generating OpenSSL Intermediate CA cert config using configuration:"
    );

    let intermediateCAConfigTemplate = `
# Reference: https://jamielinux.com/docs/openssl-certificate-authority/create-the-root-pair.html

[ ca ]
# \`man ca\`
default_ca = CA_default

[ CA_default ]
# Directory and file locations.
dir               = /certs/ca/intermediate
certs             = $dir/certs
crl_dir           = $dir/crl
new_certs_dir     = $dir/newcerts
database          = $dir/index.txt
serial            = $dir/serial
RANDFILE          = $dir/private/.rand

# The root key and root certificate.
private_key       = $dir/private/intermediate.key.pem
certificate       = $dir/certs/intermediate.cert.pem

# For certificate revocation lists.
crlnumber         = $dir/crlnumber
crl               = $dir/crl/intermediate.crl.pem
crl_extensions    = crl_ext
default_crl_days  = 30

# SHA-1 is deprecated, so use SHA-2 instead.
default_md        = sha256

name_opt          = ca_default
cert_opt          = ca_default
default_days      = 375
preserve          = no
policy            = policy_loose

[ policy_strict ]
# The root CA should only sign intermediate certificates that match.
# See the POLICY FORMAT section of \`man ca\`.
countryName             = match
stateOrProvinceName     = match
organizationName        = match
organizationalUnitName  = optional
commonName              = supplied
emailAddress            = optional

[ policy_loose ]
# Allow the intermediate CA to sign a more diverse range of certificates.
# See the POLICY FORMAT section of the \`ca\` man page.
countryName             = optional
stateOrProvinceName     = optional
localityName            = optional
organizationName        = optional
organizationalUnitName  = optional
commonName              = supplied
emailAddress            = optional

[ req ]
# Options for the \`req\` tool (\`man req\`).
default_bits        = 2048
distinguished_name  = req_distinguished_name
string_mask         = utf8only
prompt              = no

# SHA-1 is deprecated, so use SHA-2 instead.
default_md          = sha256

# Extension to add when the -x509 option is used.
x509_extensions     = v3_ca

[ req_distinguished_name ]
# See <https://en.wikipedia.org/wiki/Certificate_signing_request>.

countryName            = ${intermediateCAConfig.country}
stateOrProvinceName    = ${intermediateCAConfig.state}
localityName           = ${intermediateCAConfig.city}
organizationName       = ${intermediateCAConfig.company}
organizationalUnitName = Intermediate Certificate Authority
commonName             = ${intermediateCAConfig.host}
emailAddress           = ${intermediateCAConfig.email}

[ v3_ca ]
# Extensions for a typical CA (\`man x509v3_config\`).
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical, CA:true
keyUsage = critical, digitalSignature, cRLSign, keyCertSign

[ v3_intermediate_ca ]
# Extensions for a typical intermediate CA (\`man x509v3_config\`).
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical, CA:true, pathlen:0
keyUsage = critical, digitalSignature, cRLSign, keyCertSign

[ usr_cert ]
# Extensions for client certificates (\`man x509v3_config\`).
basicConstraints = CA:FALSE
nsCertType = client, email
nsComment = "OpenSSL Generated Client Certificate"
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer
keyUsage = critical, nonRepudiation, digitalSignature, keyEncipherment
extendedKeyUsage = clientAuth, emailProtection

[ server_cert ]
# Extensions for server certificates (\`man x509v3_config\`).
basicConstraints = CA:FALSE
nsCertType = server
nsComment = "OpenSSL Generated Server Certificate"
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer:always
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth

[ crl_ext ]
# Extension for CRLs (\`man x509v3_config\`).
authorityKeyIdentifier=keyid:always

[ ocsp ]
# Extension for OCSP signing certificates (\`man ocsp\`).
basicConstraints = CA:FALSE
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer
keyUsage = critical, digitalSignature
extendedKeyUsage = critical, OCSPSigning
`;

    // console.log("\nOpenSSL Config File:");
    // console.log(intermediateCAConfigTemplate);
    fs.writeFileSync(
        __dirname + "/../config/generated/intermediateca_openssl.cnf",
        intermediateCAConfigTemplate,
        {
            encoding: "utf8",
        }
    );
}

function generateSignedTLSConfigs(configType, hostConfig) {
    console.log("Generating OpenSSL cert config using configuration:");

    let hostname = "";
    if (typeof hostConfig === "string") {
        hostname = hostConfig;
        hostConfig = { host: hostConfig };
    }

    if (hostConfig)
        if (!hostConfig.host) {
            console.error(
                "Host name missing in TLSCerts config",
                JSON.stringify(hostConfig, null, 4)
            );
            process.exit(1);
        } else {
            hostname = hostConfig.host;
        }

    let openSSLConfigTemplate = `
        # Reference: https://jamielinux.com/docs/openssl-certificate-authority/create-the-root-pair.html
        
        [ ca ]
        # \`man ca\`
        default_ca = CA_default
        
        [ CA_default ]
        # Directory and file locations.
        dir               = /certs/ca/intermediate
        certs             = $dir/certs
        crl_dir           = $dir/crl
        new_certs_dir     = $dir/newcerts
        database          = $dir/index.txt
        serial            = $dir/serial
        RANDFILE          = $dir/private/.rand
        
        # The root key and root certificate.
        private_key       = $dir/private/intermediate.key.pem
        certificate       = $dir/certs/intermediate.cert.pem
        
        # For certificate revocation lists.
        crlnumber         = $dir/crlnumber
        crl               = $dir/crl/intermediate.crl.pem
        crl_extensions    = crl_ext
        default_crl_days  = 30
        
        # SHA-1 is deprecated, so use SHA-2 instead.
        default_md        = sha256
        
        name_opt          = ca_default
        cert_opt          = ca_default
        default_days      = 375
        preserve          = no
        policy            = policy_loose
        
        [ policy_strict ]
        # The root CA should only sign intermediate certificates that match.
        # See the POLICY FORMAT section of \`man ca\`.
        countryName             = match
        stateOrProvinceName     = match
        organizationName        = match
        organizationalUnitName  = optional
        commonName              = supplied
        emailAddress            = optional
        
        [ policy_loose ]
        # Allow the intermediate CA to sign a more diverse range of certificates.
        # See the POLICY FORMAT section of the \`ca\` man page.
        countryName             = optional
        stateOrProvinceName     = optional
        localityName            = optional
        organizationName        = optional
        organizationalUnitName  = optional
        commonName              = supplied
        emailAddress            = optional
        
        [ req ]
        # Options for the \`req\` tool (\`man req\`).
        distinguished_name  = req_distinguished_name
        string_mask         = utf8only
        prompt              = no
        
        # SHA-1 is deprecated, so use SHA-2 instead.
        default_md          = sha256
        
        # Extension to add when the -x509 option is used.
        x509_extensions     = v3_ca
        days                = 365

        [ req_distinguished_name ]
        # See <https://en.wikipedia.org/wiki/Certificate_signing_request>.
        countryName            = ${hostConfig.country}
        stateOrProvinceName    = ${hostConfig.state}
        localityName           = ${hostConfig.city}
        organizationName       = ${hostConfig.company}
        organizationalUnitName = ${hostConfig.orgUnit}
        commonName             = ${hostConfig.host}
        emailAddress           = ${hostConfig.email}

        [ v3_ca ]
        # Extensions for a typical CA (\`man x509v3_config\`).
        subjectKeyIdentifier = hash
        authorityKeyIdentifier = keyid:always,issuer
        basicConstraints = critical, CA:true
        keyUsage = critical, digitalSignature, cRLSign, keyCertSign
        
        [ v3_intermediate_ca ]
        # Extensions for a typical intermediate CA (\`man x509v3_config\`).
        subjectKeyIdentifier = hash
        authorityKeyIdentifier = keyid:always,issuer
        basicConstraints = critical, CA:true, pathlen:0
        keyUsage = critical, digitalSignature, cRLSign, keyCertSign
        
        [ usr_cert ]
        # Extensions for client certificates (\`man x509v3_config\`).
        basicConstraints = CA:FALSE
        nsCertType = client, email
        nsComment = "OpenSSL Generated Client Certificate"
        subjectKeyIdentifier = hash
        authorityKeyIdentifier = keyid,issuer
        keyUsage = critical, nonRepudiation, digitalSignature, keyEncipherment
        extendedKeyUsage = clientAuth, emailProtection
        
        [ server_cert ]
        # Extensions for server certificates (\`man x509v3_config\`).
        basicConstraints = CA:FALSE
        nsCertType = server
        nsComment = "OpenSSL Generated Server Certificate"
        subjectKeyIdentifier = hash
        authorityKeyIdentifier = keyid,issuer:always
        keyUsage = critical, digitalSignature, keyEncipherment
        extendedKeyUsage = serverAuth
        
        [ crl_ext ]
        # Extension for CRLs (\`man x509v3_config\`).
        authorityKeyIdentifier=keyid:always
        
        [ ocsp ]
        # Extension for OCSP signing certificates (\`man ocsp\`).
        basicConstraints = CA:FALSE
        subjectKeyIdentifier = hash
        authorityKeyIdentifier = keyid,issuer
        keyUsage = critical, digitalSignature
        extendedKeyUsage = critical, OCSPSigning
        `;

    let env_tag = "";
    if (configType === "abr") {
        env_tag = `_${hostConfig.env}`;
    }

    console.log(`\nOpenSSL Config File for ${hostname}:`);
    console.log(openSSLConfigTemplate);
    fs.writeFileSync(
        __dirname +
            `/../config/generated/${configType}${env_tag}_${hostname}_openssl.cnf`,
        openSSLConfigTemplate,
        {
            encoding: "utf8",
        }
    );
}
