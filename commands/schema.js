"use strict";

// Require Node.js Dependencies
const { access, readFile } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const Manifest = require("@slimio/manifest");
const Config = require("@slimio/config");
const { fillWithSchema } = require("@slimio/json-schema-prompt");
const { red } = require("kleur");

// Require Internal Dependencies
const { checkBeInAgentOrSubDir } = require("../src/utils");
const { getToken } = require("../src/i18n");

/**
 * @function schema
 * @param {string} addon addon
 */
async function schema(addon) {
    let addonDir;
    if (typeof addon === "string") {
        checkBeInAgentOrSubDir();

        addonDir = join(process.cwd(), "addons", addon);
        await access(addonDir);
    }
    else {
        addonDir = process.cwd();
    }

    const man = Manifest.open(join(addonDir, "slimio.toml"));
    if (man.config === null) {
        console.log(red().bold(getToken("schema_no_config")));

        return;
    }
    console.log(man.config);

    const configPath = join(addonDir, man.config);
    await access(configPath);

    const buf = await readFile(configPath);
    const schemaJson = JSON.parse(buf.toString());
    const configJson = await fillWithSchema(schemaJson);

    const config = new Config(join(addonDir, "config.json"), {
        createOnNoEntry: true,
        writeOnSet: true,
        defaultSchema: schemaJson
    });

    await config.read();
    config.payload = configJson;
    await config.close();

}

module.exports = schema;
