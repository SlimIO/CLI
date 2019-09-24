"use strict";

// Require Node.js Dependencies
const { join } = require("path");
const { promises: { readFile } } = require("fs");

// Require Third-party Dependencies
const qoa = require("qoa");
const Manifest = require("@slimio/manifest");
const { AddonFactory } = require("@slimio/addon-factory");
const is = require("@slimio/is");
const { yellow, white } = require("kleur");
const { validate } = require("@slimio/validate-addon-name");

// Require Internal Dependencies
const { fileMustNotExist, checkBeInAgentOrSubDir, writeToAgent } = require("../src/utils");

// CONSTANTS
const E_TYPES = new Set(["Addon", "Manifest"]);

/**
 * @async
 * @function generateAndLogAddon
 * @param {string} name
 * @param {string} path
 * @returns {Promise<void>}
 */
async function generateAndLogAddon(name, path) {
    await (new AddonFactory(name)).generate(path);
    console.log(white().bold(`\n > '${yellow().bold(name)}' addon generated at ${yellow().bold(path)}\n`));

    const str = await readFile(join(path, name, "index.js"), "utf-8");
    console.log(str);
}

/**
 * @async
 * @function create
 * @param {string} [type]
 * @param {*} config
 * @returns {Promise<void>}
 */
async function create(type, config = {}) {
    if (is.nullOrUndefined(type)) {
        const { createFile } = await qoa.interactive({
            query: "What do you want to create ?",
            handle: "createFile",
            menu: ["Addon", "Manifest"]
        });
        // eslint-disable-next-line
        type = createFile;
    }
    if (!E_TYPES.has(type)) {
        throw new Error(`Unknown type '${type}'`);
    }

    switch (type) {
        case "Addon": {
            checkBeInAgentOrSubDir();
            const path = join(process.cwd(), "addons");
            if (is.string(config.name)) {
                await generateAndLogAddon(config.name, path);
                break;
            }
            const { addonName } = await qoa.input({
                query: "Give a name for the Addon:",
                handle: "addonName"
            });

            if (!validate(addonName)) {
                throw new Error(`invalid addon name '${addonName}'`);
            }

            const { register } = await qoa.confirm({
                query: `Do you want to add '${addonName}' to the local agent.json ?`,
                handle: "register",
                accept: "y"
            });
            if (register) {
                await writeToAgent(addonName, true);
            }

            await generateAndLogAddon(addonName, path);

            break;
        }
        case "Manifest": {
            await fileMustNotExist("slimio.toml");

            let tomlType = config.type;
            if (!Reflect.has(config, "type")) {
                const res = await qoa.interactive({
                    query: "Choose the project type",
                    handle: "type",
                    menu: [...Manifest.TYPES]
                });
                tomlType = res.type;
            }

            const buf = await readFile(join(process.cwd(), "package.json"));
            const { name, version } = JSON.parse(buf.toString());

            const realName = name.charAt(0) === "@" ? name.split("/")[1] : name;
            const options = { name: realName, version, type: tomlType };
            const path = join(process.cwd(), "slimio.toml");
            Manifest.create(options, path, true);
            console.log(white().bold(`\n > slimio.toml Manifest created at ${yellow().bold(process.cwd())}\n`));

            const str = await readFile(path, "utf-8");
            console.log(str);
            break;
        }
    }
}

module.exports = create;
