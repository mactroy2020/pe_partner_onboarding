const fs = require("fs");
const path = require("path");
const execSync = require("child_process").execSync;

async function main() {
    const projectConfigFile = require(__dirname + "/../config/config.json");

    if (projectConfigFile.abr_env && projectConfigFile.abr_env.length > 0) {
        let certs = projectConfigFile.abr_env.map((hostConfig) => {
            generateABREnvironmentCerts("abr", {
                ...projectConfigFile.defaultConfig,
                ...hostConfig,
            });
        });

        await Promise.all(certs);
    }

    if (projectConfigFile.abr_env && projectConfigFile.abr_env.length > 0) {
        let certs = projectConfigFile.host_tls.map((hostConfig) => {
            generateHostTLSCerts("tls", {
                ...projectConfigFile.defaultConfig,
                ...hostConfig,
            });
        });

        await Promise.all(certs);
    }
}

function generateABREnvironmentCerts(typeName, abrConfig) {
    console.log(
        `Generating ABR Certs for ${typeName}::${JSON.stringify(abrConfig)}`
    );
    const cert_path = path.resolve(`/certs/${abrConfig.env}_${abrConfig.host}`);
    const dirPath = path.resolve(`${__dirname}/../${cert_path}`);
    const sslConfigFile = `/ca/config/generated/${typeName}_${abrConfig.env}_${abrConfig.host}_openssl.cnf`;

    console.log(`Creating directory: ${dirPath}`);

    fs.mkdirSync(dirPath, { recursive: true });
    const output = execSync(
        `docker run --rm -v $(pwd)/certs:/certs -v $(pwd)/src:/ca/scripts -v $(pwd)/config:/ca/config partner-ca:latest /bin/bash -c "cd /ca/scripts && sh generate-abr-certs.sh ${cert_path} ${sslConfigFile}"`,
        { encoding: "utf-8" }
    );
    console.log(output);
}

function generateHostTLSCerts(typeName, hostTLSConfig) {
    console.log(
        `Generating TLS Certs for ${typeName}::${JSON.stringify(hostTLSConfig)}`
    );
    const cert_path = path.resolve(`/certs/tls_${hostTLSConfig.host}`);
    const dirPath = path.resolve(`${__dirname}/../${cert_path}`);
    const sslConfigFile = `/ca/config/generated/tls_${hostTLSConfig.host}_openssl.cnf`;

    console.log(`Creating directory: ${dirPath}`);

    fs.mkdirSync(dirPath, { recursive: true });
    const output = execSync(
        `docker run --rm -v $(pwd)/certs:/certs -v $(pwd)/src:/ca/scripts -v $(pwd)/config:/ca/config partner-ca:latest /bin/bash -c "cd /ca/scripts && sh generate-tls-cert.sh ${cert_path} ${hostTLSConfig.host} ${sslConfigFile}"`,
        { encoding: "utf-8" }
    );
    console.log(output);
}

main();
