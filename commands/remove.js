"use strict";

// Require Node.js Dependencies
const { join } = require("path");
const { access } = require("fs").promises;
const { performance } = require("perf_hooks");

// Require Third-party Dependencies
const premove = require("premove");
const Spinner = require("@slimio/async-cli-spinner");
const levenshtein = require("fast-levenshtein");
const { white, cyan, grey, yellow, green, red } = require("kleur");

// Require Internal Dependencies
const { checkBeInAgentOrSubDir } = require("../src/utils");
const { removeAddonsFromAgent, getLocalAddons } = require("../src/agent");

// Config
Spinner.DEFAULT_SPINNER = "dots";

/**
 * @async
 * @function removeAddon
 * @param {Array<string, string>} options
 * @returns {Promise<void>}
 */
async function removeAddon([name, dir]) {
    const spinner = new Spinner({
        prefixText: white().bold(`Removing addon ${cyan().bold(name)}`)
    }).start();
    const start = performance.now();

    try {
        await premove(dir);
        const executionTimeMs = green().bold(`${(performance.now() - start).toFixed(2)}ms`);
        spinner.succeed(white().bold(`Successfully removed addon in ${executionTimeMs}`));
    }
    catch (err) {
        spinner.failed(err.message);
    }
}

/**
 * @async
 * @function addonDirExist
 * @param {!string} addonName
 * @returns {any}
 */
async function addonDirExist(addonName) {
    try {
        const addonDir = join(process.cwd(), "addons", addonName);
        await access(addonDir);

        return [addonName, addonDir];
    }
    catch (err) {
        return null;
    }
}

/**
 * @async
 * @function remove
 * @param {string[]} [addons]
 * @returns {Promise<void>}
 */
async function remove(addons = []) {
    try {
        checkBeInAgentOrSubDir();
    }
    catch (err) {
        console.log(grey().bold(`\n > ${red().bold("Current working dir as not been detected as a SlimIO Agent")}`));
        console.log(grey().bold(` > ${yellow().bold(process.cwd())}`));

        return;
    }
    console.log("");

    const result = await Promise.all(addons.map((name) => addonDirExist(name)));
    const toRemove = result.filter((row) => row !== null);

    if (toRemove.length === 0) {
        console.log(red().bold(" > Failed to found any addon(s) to remove"));
        const addonName = addons.shift();
        const localAddons = await getLocalAddons();

        const isMatching = [];
        for (const item of localAddons) {
            const count = levenshtein.get(item, addonName);
            if (count <= 2) {
                isMatching.push(item);
            }
        }
        if (isMatching.length > 0) {
            const str = isMatching.map((row) => yellow().bold(row)).join(",");
            console.log(white().bold(` > Did you mean: ${str} ?`));
        }

        return;
    }

    // Remove all addons recursively
    await Promise.all(toRemove.map(removeAddon));

    // Remove from agent.json
    const agentConfig = join(process.cwd(), "agent.json");
    await removeAddonsFromAgent(agentConfig, ...toRemove.map((row) => row[0]));
}

module.exports = remove;
