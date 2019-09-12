"use strict";

// Require Node.js Dependencies
const { existsSync, promises: { writeFile, readFile } } = require("fs");
const { join } = require("path");
const { performance } = require("perf_hooks");

// Require Third-party Dependencies
const { createDirectory } = require("@slimio/utils");
const { white, yellow, red, grey, green } = require("kleur");
const jsonDiff = require("json-diff");
const Spinner = require("@slimio/async-cli-spinner");

// Require Internal Dependencies
const { installAddon, checkBeInAgentOrAddonDir } = require("../src/utils");

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

        console.log(grey().bold(jsonDiff.diffString(JSON.parse(str), json)));
        await writeFile(agentConfig, JSON.stringify(json, null, 4));
    }
    else {
        console.log(red().bold("(!) No local configuration detected. Creating one from scratch."));
        await writeFile(agentConfig, JSON.stringify({ addons }, null, 4));
    }
}

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