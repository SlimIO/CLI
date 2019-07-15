"use strict";

// Require Node.js Dependencies
const { strictEqual } = require("assert").strict;
const { rename, mkdir } = require("fs").promises;
const { join } = require("path");
const { performance } = require("perf_hooks");

// Require Third-party Dependencies
const { yellow, white, green, red, cyan } = require("kleur");
const download = require("@slimio/github");
const Spinner = require("@slimio/async-cli-spinner");

// Require Internal Dependencies
const {
    BUILT_IN_ADDONS,
    directoryExist,
    npmInstall,
    installAddon
} = require("../src/utils");

/**
 * @function installAgentDep
 * @description Install SlimIO Agent
 * @param {!string} agentDir agent directory location
 * @param {boolean} [verbose=true] Display spinners
 * @returns {Promise<void>}
 */
async function installAgentDep(agentDir, verbose = true) {
    const spinner = new Spinner({
        prefixText: cyan().bold("Agent"),
        spinner: "dots",
        verbose
    }).start("Installing dependencies");

    await new Promise((resolve, reject) => {
        const subProcess = npmInstall(agentDir, true);
        subProcess.once("close", (code) => {
            spinner.succeed("Node dependencies installed");
            resolve();
        });
        subProcess.once("error", (err) => {
            spinner.failed("Something wrong append !");
            reject(err);
        });
    });
}

/**
 * @async
 * @function initAgent
 * @param {!string} init initial directory
 * @param {object} [options]
 * @param {string[]} [options.additionalAddons]
 * @param {boolean} [options.verbose]
 * @returns {Promise<void>}
 */
async function initAgent(init, options = Object.create(null)) {
    const { additionalAddons = [], verbose = true } = options;
    console.log(white().bold("Initialize new SlimIO Agent!"));
    strictEqual(init.length !== 0, true, new Error("directoryName length must be 1 or more"));

    await directoryExist(init);

    const startTime = performance.now();
    const agentDir = join(process.cwd(), init);
    const addonDir = join(agentDir, "addons");
    {
        const dirName = await download("SlimIO.Agent", {
            dest: process.cwd(),
            auth: process.env.GIT_TOKEN,
            extract: true
        });
        await rename(dirName, agentDir);

        console.log(`Agent successfully cloned at ${yellow().bold(agentDir)}`);
    }

    // Create addons directory
    await mkdir(addonDir);

    console.log(`\n${yellow().bold("Installing Built-in addons")} and ${yellow().bold("Install Agent dependencies")}`);
    if (additionalAddons.length > 0) {
        const addonsList = additionalAddons.map((name) => yellow().bold(name)).join(",");
        console.log(`${red().bold("Warning!")} Additional addons detected => ${addonsList}\n`);
    }

    const toInstall = [...new Set([...BUILT_IN_ADDONS, ...additionalAddons])];
    await Spinner.startAll([
        Spinner.create(installAgentDep, agentDir, verbose),
        ...toInstall.map((addonName) => Spinner.create(installAddon, addonName, { dlDir: addonDir, verbose }))
    ]);

    const executeTimeMs = (performance.now() - startTime) / 1000;
    console.log(green().bold(`\nInstallation completed in ${yellow().bold(executeTimeMs.toFixed(2))} seconds`));
}

module.exports = initAgent;
