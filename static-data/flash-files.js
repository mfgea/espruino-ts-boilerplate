const fs = require('fs');
const execSync = require('child_process').execSync;
const yaml = require('js-yaml');
const files = require('./files');

const envConfig = yaml.load(fs.readFileSync("../config/env-config.yaml", "utf8"));

const tmpFile = '.tmp.js';

files.forEach(file => {
    console.info("Writing: ", file.name);
    const tmpContent =
        `require('Storage').write("__FILE_NAME__", E.toArrayBuffer(atob('__FILE_DATA__')));`
            .replace('__FILE_NAME__', file.name)
            .replace('__FILE_DATA__', file.data)

    fs.writeFileSync(
        tmpFile,
        tmpContent
    );

    execSync(`${require.resolve("espruino/bin/espruino-cli")} --board ${envConfig.board} -b ${envConfig.port_speed} --port ${envConfig.port} ${tmpFile}`);
    fs.unlinkSync(tmpFile);
});