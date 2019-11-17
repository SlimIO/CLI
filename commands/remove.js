"use strict";

// Require Node.js Dependencies
const { join } = require("path");
const { access, rmdir } = require("fs").promises;
const { performance } = require("perf_hooks");

// Require Third-party Dependencies
const Spinner = require("@slimio/async-cli-spinner");
const levenshtein = require("fast-levenshtein");
const { white, cyan, grey, yellow, green, red } = require("kleur");
const qoa = require("qoa");

// Require Internal Dependencies
const { checkBeInAgentOrSubDir, cleanupAddonsList } = require("../src/utils");
const { removeAddonsFromAgent, getLocalAddons } = require("../src/agent");
const { getToken } = require("../src/i18n");

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
        prefixText: white().bold(getToken("remove_remove_addon", cyan().bold(name)))
    }).start();
    const start = performance.now();

    try {
        await rmdir(dir, { recursive: true });
        const executionTimeMs = green().bold(`${(performance.now() - start).toFixed(2)}ms`);
        spinner.succeed(white().bold(getToken("remove_success", executionTimeMs)));
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
 * @param {object} [options]
 * @returns {Promise<void>}
 */
async function remove(addons = [], options = {}) {
    const { interactive = false } = options;

    try {
        checkBeInAgentOrSubDir();
    }
    catch (err) {
        console.log(grey().bold(`\n > ${red().bold(getToken("remove_not_slimio"))}`));
        console.log(grey().bold(` > ${yellow().bold(process.cwd())}`));

        return;
    }
    console.log("");

    const localAddons = await getLocalAddons();
    if (interactive) {
        const { addon } = await qoa.interactive({
            query: white().bold(getToken("remove_remove_addon_ask")),
            handle: "addon",
            menu: [...localAddons]
        });
        addons.push(addon);
        console.log("");
    }

    const result = await Promise.all(cleanupAddonsList(addons).map((name) => addonDirExist(name)));
    const toRemove = result.filter((row) => row !== null);

    if (toRemove.length === 0) {
        console.log(red().bold(` > ${getToken("remove_failed_remove")}`));
        const addonName = addons.shift();

        const isMatching = [];
        for (const item of localAddons) {
            const count = levenshtein.get(item, addonName);
            if (count <= 2) {
                isMatching.push(item);
            }
        }
        if (isMatching.length > 0) {
            const str = isMatching.map((row) => yellow().bold(row)).join(",");
            const removeToken = getToken("remove_mean_question", str);
            console.log(white().bold(` > ${removeToken}`));
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
