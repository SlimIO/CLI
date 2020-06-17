"use strict";

// Require Node.js Dependencies
const { join } = require("path");
const { performance } = require("perf_hooks");
const { existsSync, rmdirSync } = require("fs");

// Require Third-party Dependencies
const { createDirectory } = require("@slimio/utils");
const { white, yellow, red, grey, green } = require("kleur");
const { parseAddonExpr } = require("@slimio/installer");
const Spinner = require("@slimio/async-cli-spinner");

// Require Internal Dependencies
const { install, checkBeInAgentOrSubDir, cleanupAddonsList, interactiveAddons } = require("../src/utils");
const { writeToAgent } = require("../src/agent");
const { getToken } = require("../src/i18n");

/**
 * @async
 * @function add
 * @param {string[]} [addons]
 * @param {object} [options]
 * @param {boolean} [options.disabled=false]
 * @returns {Promise<void>}
 */
async function add(addons = [], options = {}) {
    const { disabled = false, interactive = false, force = false } = options;

    try {
        checkBeInAgentOrSubDir();
    }
    catch (err) {
        console.log(grey().bold(`\n > ${red().bold(getToken("add_workdir_not_agent"))}`));
        console.log(grey().bold(` > ${yellow().bold(process.cwd())}`));

        return;
    }

    if (interactive) {
        const isOk = await interactiveAddons(addons);
        if (!isOk && addons.length === 0) {
            return;
        }
    }

    // Generate 'addons' directory if it doesn't exist!
    const addonDirectory = join(process.cwd(), "addons");
    await createDirectory(addonDirectory);

    const addonsChecked = [];
    const startTime = performance.now();
    for (const addon of cleanupAddonsList(addons)) {
        const { repoName } = parseAddonExpr(addon);
        const addonPath = join(addonDirectory, repoName);

        if (existsSync(addonPath)) {
            if (force) {
                rmdirSync(addonPath, { recursive: true });
            }
            else {
                console.log(`\n > ${white().bold(getToken("add_addon_already_installed", yellow().bold(repoName)))}`);
                continue;
            }
        }
        console.log(white().bold(`\n > ${getToken("add_adding_addon", yellow().bold(addon))}`));
        addonsChecked.push(addon);
    }
    await new Promise((resolve) => setImmediate(resolve));

    const installOptions = { dest: addonDirectory };
    const addonInstalled = await Spinner.startAll([
        ...addonsChecked.map((addonName) => Spinner.create(install, addonName, installOptions))
    ], { recap: "error" });

    if (addonsChecked.length > 0) {
        await writeToAgent(addonInstalled.filter((addon) => addon !== undefined), !disabled);
    }

    const executeTimeMs = (performance.now() - startTime) / 1000;
    const completedToken = getToken("add_installation_completed", yellow().bold(executeTimeMs.toFixed(2)));
    console.log("");
    console.log(green().bold(completedToken));
}

module.exports = add;
