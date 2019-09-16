"use strict";

// Require Node.js Dependencies
const { join } = require("path");
const { performance } = require("perf_hooks");

// Require Third-party Dependencies
const { createDirectory } = require("@slimio/utils");
const { white, yellow, red, grey, green } = require("kleur");
const Spinner = require("@slimio/async-cli-spinner");

// Require Internal Dependencies
const { installAddon, checkBeInAgentOrAddonDir, writeToAgent } = require("../src/utils");

/**
 * @async
 * @function add
 * @param {string[]} [addons]
 * @param {string[]} [nonActif]
 * @returns {Promise<void>}
 */
async function add(addons = [], nonActif = []) {
    try {
        checkBeInAgentOrAddonDir();
    }
    catch (err) {
        console.log(grey().bold(`\n > ${red().bold("Current working dir as not been detected as a SlimIO Agent")}`));
        console.log(grey().bold(` > ${yellow().bold(process.cwd())}`));

        return;
    }

    const addonsChecked = [];
    const addonNonActif = new Set([...nonActif]);
    const startTime = performance.now();
    for (const addon of [...addons, ...nonActif]) {
        console.log(white().bold(`Adding addon '${yellow().bold(addon)}'`));
        await createDirectory(join(process.cwd(), "addons"));

        /** @type {URL} */
        let myurl;
        try {
            myurl = new URL(addon);
            console.log("\n");

            if (myurl.host !== "github.com") {
                throw new Error("URL hostname must be github.com");
            }

            const [, orga, add] = myurl.pathname.split("/");
            if (orga !== "SlimIO") {
                throw new Error("At this time, organisation must be SlimIO");
            }
            addonsChecked.push(add);
        }
        catch (error) {
            console.log(grey().bold("(!) Not detected as an URL.\n"));
            if (addon.split("/").length === 2) {
                const [orga, add] = addon.split("/");
                if (orga !== "SlimIO") {
                    throw new Error("At this time, organisation must be SlimIO");
                }
                addonsChecked.push(add);
            }
            else {
                addonsChecked.push(addon);
            }
        }
    }

    const addonInstalled = await Spinner.startAll([
        ...addonsChecked.map((addonName) => Spinner.create(installAddon, addonName, { dlDir: join(process.cwd(), "addons") }))
    ]);

    for (const addonName of addonInstalled.filter((addon) => addon !== undefined)) {
        await writeToAgent(addonName, !addonNonActif.has(addonName));
    }

    const executeTimeMs = (performance.now() - startTime) / 1000;
    console.log(green().bold(`\nInstallation completed in ${yellow().bold(executeTimeMs.toFixed(2))} seconds`));
}

module.exports = add;
