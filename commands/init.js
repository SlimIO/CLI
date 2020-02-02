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
const { directoryMustNotExist, install, cleanupAddonsList, interactiveAddons } = require("../src/utils");
const { getToken } = require("../src/i18n");

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
    }).start(white().bold(getToken("init_install_deps")));

    try {
        await installDependencies(agentDir, true);
        spinner.succeed(green().bold(getToken("init_install_done")));
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
 * @param {boolean} [options.nocache=false]
 * @returns {Promise<void>}
 */
async function initAgent(init, options = Object.create(null)) {
    const { addons = [], verbose = true, set, interactive = false, nocache } = options;

    // Verify set
    if (typeof set === "string" && !ADDONS_SETS.has(set)) {
        console.log(grey().bold(`\n > ${red().bold(getToken("init_unknow", set))}`));
        const sets = [...ADDONS_SETS.keys()].map((name) => yellow().bold(name)).join(",");
        console.log(white().bold(getToken("init_available", sets)));

        return;
    }

    if (interactive) {
        await interactiveAddons(addons);
    }

    console.log(white().bold(`\n${getToken("init_full_initialize")}`));
    console.log(grey().bold("-----------------------------------------------"));
    strictEqual(init.length !== 0, true, new Error(getToken("init_error_directory")));

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
        downloadFromRemote: nocache,
        token: process.env.GIT_TOKEN
    });

    // Create addons directory
    const addonDir = join(agentDir, "addons");
    await mkdir(addonDir, { recursive: true });

    if (addons.length > 0) {
        const addonsList = addons.map((name) => yellow().bold(name)).join(",");
        console.log(getToken("init_additional_addon", red().bold("!! Warning"), addonsList));
        console.log(grey().bold(getToken("init_separator")));
    }

    const setAddons = ADDONS_SETS.has(set) ? ADDONS_SETS.get(set) : [];
    const toInstall = [...new Set([...BUILT_IN_ADDONS, ...cleanupAddonsList(addons), ...setAddons])];
    await Spinner.startAll([
        Spinner.create(installAgentDep, agentDir, verbose),
        ...toInstall.map((addonName) => Spinner.create(install, addonName, { dest: addonDir, verbose }))
    ], { recap: "error" });

    const executeTimeMs = ms(performance.now() - startTime, { long: true });
    console.log(grey().bold(getToken("init_separator")));
    console.log(white().bold(getToken("init_completed", green().bold(executeTimeMs))));

    // Write agent.json
    const localConfig = { addons: {} };
    for (const addonName of BUILT_IN_ADDONS) {
        localConfig.addons[addonName.toLowerCase()] = { active: true };
    }
    await writeFile(join(agentDir, "agent.json"), JSON.stringify(localConfig, null, 4));

    const initSuccessToken = getToken("init_success", cyan().bold(agentDir));
    console.log(yellow().bold(`\n${initSuccessToken}`));
    console.log(grey().bold(`${getToken("init_cd", init)}\n`));
}

module.exports = initAgent;
