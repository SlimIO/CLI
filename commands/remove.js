"use strict";

// Require Node.js Dependencies
const { join } = require("path");
const { existsSync, readFileSync, writeFileSync } = require("fs");
const { performance } = require("perf_hooks");

// Require Third-party Dependencies
const premove = require("premove");
const Spinner = require("@slimio/async-cli-spinner");
const jsonDiff = require("json-diff");
const { white, cyan, grey, yellow, green } = require("kleur");

// Require Internal Dependencies
const { checkBeInAgentOrAddonDir } = require("../src/utils");

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
 * @function remove
 * @param {string[]} [addons]
 * @returns {Promise<void>}
 */
async function remove(addons = []) {
    try {
        checkBeInAgentOrAddonDir();
    }
    catch (err) {
        console.log(grey().bold(`\n > ${red().bold("Current working dir as not been detected as a SlimIO Agent")}`));
        console.log(grey().bold(` > ${yellow().bold(process.cwd())}`));

        return;
    }
    console.log("");

    const toRemove = [];
    for (const addonName of addons) {
        const addonDir = join(process.cwd(), "addons", addonName);
        if (existsSync(addonDir)) {
            toRemove.push([addonName, addonDir]);
        }
    }

    // Remove all addons recursively
    await Promise.all(toRemove.map(removeAddon));

    try {
        const agentConfig = join(process.cwd(), "agent.json");
        const str = readFileSync(agentConfig, "utf-8");
        const config = JSON.parse(str);

        for (const [name] of toRemove) {
            Reflect.deleteProperty(config.addons, name);
        }

        console.log("");
        console.log(grey().bold(jsonDiff.diffString(JSON.parse(str), config)));
        writeFileSync(agentConfig, JSON.stringify(config, null, 4));
    }
    catch (err) {
        console.error(err);
    }
}

module.exports = remove;
