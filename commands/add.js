"use strict";

// Require Node.js Dependencies
const { join } = require("path");
const { performance } = require("perf_hooks");

// Require Third-party Dependencies
const { createDirectory } = require("@slimio/utils");
const { white, yellow, red, grey, green } = require("kleur");
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
    const { disabled = false, interactive = false } = options;

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

    const addonsChecked = [];
    const startTime = performance.now();
    for (const addon of cleanupAddonsList(addons)) {
        const addToken = getToken("add_adding_addon", yellow().bold(addon));
        const slimioSupportedToken = getToken("add_error_slimio_supported");

        console.log(white().bold(`\n > ${addToken}`));
        await createDirectory(join(process.cwd(), "addons"));


        /** @type {URL} */
        let myurl;
        try {
            myurl = new URL(addon);
            console.log("\n");

            if (myurl.host !== "github.com") {
                throw new Error(getToken("add_error_url_not_found"));
            }

            const [, orga, add] = myurl.pathname.split("/");
            if (orga !== "SlimIO") {
                throw new Error(slimioSupportedToken);
            }
            addonsChecked.push(add);
        }
        catch (error) {
            console.log(grey().bold(getToken("add_not_url")));
            console.log("");
            if (addon.split("/").length === 2) {
                const [orga, add] = addon.split("/");
                if (orga !== "SlimIO") {
                    throw new Error(slimioSupportedToken);
                }
                addonsChecked.push(add);
            }
            else {
                addonsChecked.push(addon);
            }
        }
    }

    const installOptions = { dest: join(process.cwd(), "addons") };
    const addonInstalled = await Spinner.startAll([
        ...addonsChecked.map((addonName) => Spinner.create(install, addonName, installOptions))
    ], { recap: "error" });

    for (const addonName of addonInstalled.filter((addon) => addon !== undefined)) {
        // TODO: optimize to write all addons at once ?
        await writeToAgent(addonName, !disabled);
    }

    const executeTimeMs = (performance.now() - startTime) / 1000;
    const completedToken = getToken("add_installation_completed", yellow().bold(executeTimeMs.toFixed(2)));
    console.log("");
    console.log(green().bold(completedToken));
}

module.exports = add;
