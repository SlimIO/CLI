"use strict";

// Require Node.js Dependencies
const { access, readFile } = require("fs").promises;
const { join, extname, dirname, sep } = require("path");

// Require Third-party Dependencies
const Manifest = require("@slimio/manifest");
const Config = require("@slimio/config");
const qoa = require("qoa");
const prettyJSON = require("@slimio/pretty-json");
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

    const configName = extname(man.config) === "" ? `${man.config}.json` : man.config;
    const config = new Config(join(addonDir, configName), {
        createOnNoEntry: true
    });
    await config.read();

    const buf = await readFile(config.schemaFile);
    const payload = await fillWithSchema(JSON.parse(buf.toString()));

    const currentAddonName = dirname(addonDir).split(sep).pop();

    prettyJSON(payload);
    console.log("");
    const { ok } = await qoa.confirm({
        query: `Do you want to apply the configuration to ${currentAddonName} ?`,
        handle: "ok",
        accept: "y"
    });

    if (ok) {
        config.payload = payload;
        await config.close();
    }
}

module.exports = schema;
