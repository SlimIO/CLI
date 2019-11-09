"use strict";

// Require Node.js Dependencies
const { join } = require("path");
const { performance } = require("perf_hooks");

// Require Third-party Dependencies
const { createDirectory } = require("@slimio/utils");
const { white, yellow, red, grey, green } = require("kleur");
const Spinner = require("@slimio/async-cli-spinner");
const { get } = require("httpie");
const stdin = require("@slimio/stdin");

// Require Internal Dependencies
const { install, checkBeInAgentOrSubDir, cleanupAddonsList } = require("../src/utils");
const { writeToAgent } = require("../src/agent");

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
        console.log(grey().bold(`\n > ${red().bold("Current working dir as not been detected as a SlimIO Agent")}`));
        console.log(grey().bold(` > ${yellow().bold(process.cwd())}`));

        return;
    }

    if (interactive) {
        console.log("");
        const { data } = await get("https://raw.githubusercontent.com/SlimIO/Governance/master/addons.json");
        const autocomplete = JSON.parse(data);

        const addonName = await stdin(grey().bold("Enter an addon name: "), { autocomplete });
        addons.push(addonName);
        console.log("");
    }

    const addonsChecked = [];
    const startTime = performance.now();
    for (const addon of cleanupAddonsList(addons)) {
        console.log(white().bold(`\n > Adding addon '${yellow().bold(addon)}'`));
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

    const installOptions = { dest: join(process.cwd(), "addons") };
    const addonInstalled = await Spinner.startAll([
        ...addonsChecked.map((addonName) => Spinner.create(install, addonName, installOptions))
    ], { recap: "error" });

    for (const addonName of addonInstalled.filter((addon) => addon !== undefined)) {
        // TODO: optimize to write all addons at once ?
        await writeToAgent(addonName, !disabled);
    }

    const executeTimeMs = (performance.now() - startTime) / 1000;
    console.log(green().bold(`\nInstallation completed in ${yellow().bold(executeTimeMs.toFixed(2))} seconds`));
}

module.exports = add;
