const fs = require("fs");

const projectConfigFile = require(__dirname + "/../config/config.json");

console.log("Generating Certificate Authority using configuration:");
console.log(JSON.stringify(projectConfigFile, null, 4));

let caConfigTemplate = `
set_var EASYRSA_REQ_COUNTRY    "${projectConfigFile.Country}"
set_var EASYRSA_REQ_PROVINCE   "${projectConfigFile.State}"
set_var EASYRSA_REQ_CITY       "${projectConfigFile.City}"
set_var EASYRSA_REQ_ORG        "${projectConfigFile.Company}"
set_var EASYRSA_REQ_EMAIL      "${projectConfigFile.Email}"
set_var EASYRSA_REQ_OU         "${projectConfigFile.OrgUnit}"
set_var EASYRSA_ALGO           "${projectConfigFile.ca.Algo}"
set_var EASYRSA_DIGEST         "${projectConfigFile.ca.Digest}"
set_var EASYRSA_REQ_CN         "${projectConfigFile.ca.Host}"
set_var EASYRSA_BATCH          "yes"
`;

console.log("\nCert Config File:");
console.log(caConfigTemplate);
fs.writeFileSync(__dirname + "/../config/ca_config_vars", caConfigTemplate, {
    encoding: "utf8",
});

console.log("Generating OpenSSL cert config using configuration:");

let openSSLConfigTemplate = `
[ req ]
prompt                 = no
days                   = 365
distinguished_name     = req_distinguished_name

[ req_distinguished_name ]
countryName            = ${projectConfigFile.Country}
stateOrProvinceName    = ${projectConfigFile.State}
localityName           = ${projectConfigFile.City}
organizationName       = ${projectConfigFile.Company}
organizationalUnitName = ${projectConfigFile.OrgUnit}
commonName             = ${projectConfigFile.ca.Host}
emailAddress           = ${projectConfigFile.Email}
`;

console.log("\nOpenSSL Config File:");
console.log(openSSLConfigTemplate);
fs.writeFileSync(__dirname + "/../config/openssl.cfg", openSSLConfigTemplate, {
    encoding: "utf8",
});
