"use strict";

// Require Node.js Dependencies
const { strictEqual } = require("assert").strict;
const { mkdir, writeFile } = require("fs").promises;
const { join } = require("path");
const { performance } = require("perf_hooks");

// Require Third-party Dependencies
const { yellow, white, green, red, cyan, grey } = require("kleur");
const Spinner = require("@slimio/async-cli-spinner");
const ms = require("ms");
const {
    extractAgent,
    installDependencies,
    CONSTANTS: { BUILT_IN_ADDONS }
} = require("@slimio/installer");

// Require Internal Dependencies
const { directoryMustNotExist, install } = require("../src/utils");

// CONSTANTS
const ADDONS_SETS = new Map([
    ["metrology", ["cpu-addon"]]
]);

// Vars
Spinner.DEFAULT_SPINNER = process.platform === "win32" ? "line" : "dots";

/**
 * @function installAgentDep
 * @description Install SlimIO Agent
 * @param {!string} agentDir agent directory location
 * @param {boolean} [verbose=true] Display spinners
 * @returns {Promise<void>}
 */
async function installAgentDep(agentDir, verbose = true) {
    const spinner = new Spinner({
        prefixText: cyan().bold("Agent"), verbose
    }).start(white().bold("Install dependencies"));

    try {
        await new Promise((resolve, reject) => {
            const subProcess = installDependencies(agentDir, true);
            subProcess.once("close", resolve);
            subProcess.once("error", reject);
        });
        spinner.succeed(green().bold("done!"));
    }
    catch (error) {
        spinner.failed(error.message);
    }
}

/**
 * @async
 * @function initAgent
 * @param {!string} init initial directory
 * @param {object} [options]
 * @param {string[]} [options.addons]
 * @param {null | string} [options.set]
 * @param {boolean} [options.verbose]
 * @returns {Promise<void>}
 */
async function initAgent(init, options = Object.create(null)) {
    const { addons = [], verbose = true, set, interactive = false } = options;

    // Verify set
    if (typeof set === "string" && !ADDONS_SETS.has(set)) {
        console.log(grey().bold(`\n > ${red().bold(`Unknown addon set with name '${set}'`)}`));
        const sets = [...ADDONS_SETS.keys()].map((name) => yellow().bold(name)).join(",");
        console.log(white().bold(` > Available sets are: ${sets}`));

        return;
    }

    if (interactive) {
        throw new Error("Not Implemented Yet");
    }

    console.log(white().bold("\nInitialize and install a complete SlimIO Agent!"));
    console.log(grey().bold("-----------------------------------------------"));
    strictEqual(init.length !== 0, true, new Error("directoryName length must be 1 or more"));

    try {
        await directoryMustNotExist(init);
    }
    catch (error) {
        console.log(grey().bold(`\n > ${red().bold(error.message)}`));
        console.log(grey().bold(` > ${yellow().bold(process.cwd())}`));

        return;
    }

    const startTime = performance.now();
    const agentDir = await extractAgent(process.cwd(), {
        name: init,
        token: process.env.GIT_TOKEN
    });

    // Create addons directory
    const addonDir = join(agentDir, "addons");
    await mkdir(addonDir, { recursive: true });

    if (addons.length > 0) {
        const addonsList = addons.map((name) => yellow().bold(name)).join(",");
        console.log(`${red().bold("!! Warning")} Additional addon(s) requested: ${addonsList}`);
        console.log(grey().bold("-----------------------------------------------"));
    }

    const setAddons = ADDONS_SETS.has(set) ? ADDONS_SETS.get(set) : [];
    const toInstall = [...new Set([...BUILT_IN_ADDONS, ...addons, ...setAddons])];
    await Spinner.startAll([
        Spinner.create(installAgentDep, agentDir, verbose),
        ...toInstall.map((addonName) => Spinner.create(install, addonName, { dest: addonDir, verbose }))
    ], { recap: "error" });

    const executeTimeMs = ms(performance.now() - startTime, { long: true });
    console.log(grey().bold("-----------------------------------------------"));
    console.log(white().bold(`Installation completed in ${green().bold(executeTimeMs)}`));

    // Write agent.json
    const localConfig = { addons: {} };
    for (const addonName of BUILT_IN_ADDONS) {
        localConfig.addons[addonName.toLowerCase()] = { active: true };
    }
    await writeFile(join(agentDir, "agent.json"), JSON.stringify(localConfig, null, 4));

    console.log(yellow().bold(`\nAgent successfully installed at: ${cyan().bold(agentDir)}`));
    console.log(grey().bold(`$ cd ${init}\n`));
}

module.exports = initAgent;
