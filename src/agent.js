"use strict";

// Require Node.js Dependencies
const { join } = require("path");
const { readdir, access } = require("fs").promises;

// Require Third-party Dependencies
const Config = require("@slimio/config");

// Require Internal Dependencies
const { BUILT_IN_ADDONS } = require("./utils");

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

module.exports = {
    getFileAddon,
    getLocalAddons
};
