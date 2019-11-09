"use strict";

// Require Node.js Dependencies
const { join } = require("path");
const { existsSync } = require("fs");
const { readdir, access, readFile, writeFile } = require("fs").promises;

// Require Third-party Dependencies
const Config = require("@slimio/config");
const { white, grey, red, yellow } = require("kleur");
const jsonDiff = require("@slimio/json-diff");
const { CONSTANTS: { BUILT_IN_ADDONS } } = require("@slimio/installer");

// CONSTANTS
const addons = BUILT_IN_ADDONS.reduce((prev, curr) => (prev[curr.toLowerCase()] = { active: true }) && prev, {});

/**
 * @async
 * @function getFileAddon
 * @returns {Promise<object>}
 */
async function getFileAddon() {
    const agentPath = join(process.cwd(), "agent.json");
    const cfg = new Config(agentPath, {
        createOnNoEntry: true
    });

    try {
        await cfg.read({ addons });
        const cfgAddons = cfg.get("addons");
        await cfg.close();

        return cfgAddons;
    }
    catch (error) {
        return { addons };
    }
}

/**
 * @async
 * @function getLocalAddons
 * @returns {Promise<Set<string>>}
 */
async function getLocalAddons() {
    const addonsDir = join(process.cwd(), "addons");
    const ret = new Set();

    const dirents = await readdir(addonsDir, { encoding: "utf8", withFileTypes: true });
    for (const dirent of dirents) {
        try {
            if (!dirent.isDirectory()) {
                continue;
            }
            await access(join(addonsDir, dirent.name, "index.js"));
            ret.add(dirent.name);
        }
        catch (err) {
            // Do nothing
        }
    }

    return ret;
}

/**
 * @async
 * @function writeToAgent
 * @param {!string} addonName
 * @param {boolean} [active=false]
 * @returns {Promise<void>}
 */
async function writeToAgent(addonName, active = false) {
    const agentConfig = join(process.cwd(), "agent.json");
    console.log(white().bold(`\nWriting addon in the local configuration '${yellow().bold(agentConfig)}'`));

    const configExist = existsSync(agentConfig);
    const addons = { [addonName]: { active } };

    if (configExist) {
        const buf = await readFile(agentConfig);
        let str = buf.toString().trim();
        if (str === "") {
            str = "{}";
        }
        const json = JSON.parse(str);
        if (!Reflect.has(json, "addons")) {
            json.addons = {};
        }
        Object.assign(json.addons, addons);

        jsonDiff(JSON.parse(str), json);
        await writeFile(agentConfig, JSON.stringify(json, null, 4));
    }
    else {
        console.log(red().bold("(!) No local configuration detected. Creating one from scratch."));
        await writeFile(agentConfig, JSON.stringify({ addons }, null, 4));
    }
}

/**
 * @async
 * @function removeAddonsFromAgent
 * @param {!string} agentFilePath
 * @param {...string[]} addons
 * @returns {Promise<void>}
 */
async function removeAddonsFromAgent(agentFilePath, ...addons) {
    const str = await readFile(agentFilePath, "utf-8");
    const config = JSON.parse(str);

    for (const name of addons) {
        Reflect.deleteProperty(config.addons, name);
    }

    console.log("");
    jsonDiff(JSON.parse(str), config);
    await writeFile(agentFilePath, JSON.stringify(config, null, 4));
}

module.exports = {
    getFileAddon,
    getLocalAddons,
    writeToAgent,
    removeAddonsFromAgent
};
