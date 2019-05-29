// Require Node.js Dependencies
const { strictEqual } = require("assert").strict;
const { rename, stat, mkdir } = require("fs").promises;
const { join } = require("path");
const { performance } = require("perf_hooks");

// Require Third-party Dependencies
const { yellow, white, green } = require("kleur");
const Spinner = require("@slimio/async-cli-spinner");

// Require Internal Dependencies
const {
    githubDownload,
    installAgentDep,
    installAddon
} = require("../src/utils");

// CONSTANT
const BUILT_IN_ADDONS = ["Events", "Socket", "Gate", "Alerting"];

async function initAgent(init, additionalAddons = []) {
    console.log(white().bold("Initialize new SlimIO Agent!"));
    strictEqual(init.length !== 0, true, new Error("directoryName length must be 1 or more"));

    try {
        const stats = await stat(init);
        if (stats.isDirectory()) {
            throw new Error(`Directory ${init} already exist`);
        }
    }
    catch (err) {
        if (err.code !== "ENOENT") {
            throw err;
        }
    }

    const startTime = performance.now();
    const agentDir = join(process.cwd(), init);
    const addonDir = join(agentDir, "addons");
    {
        const dirName = await githubDownload("SlimIO.Agent");
        await rename(dirName, agentDir);

        console.log(`Agent successfully cloned at ${yellow().bold(agentDir)}`);
    }

    // Create addons directory
    await mkdir(addonDir);

    console.log(`\n${yellow().bold("Installing Built-in addons")} and ${yellow().bold("Install Agent dependencies")}`);
    const toInstall = [...new Set([...BUILT_IN_ADDONS, ...additionalAddons])];
    await Spinner.startAll([
        Spinner.create(installAgentDep, agentDir),
        ...toInstall.map((addonName) => Spinner.create(installAddon, addonName, addonDir))
    ]);

    const executeTimeMs = (performance.now() - startTime) / 1000;
    console.log(green().bold(`\nInstallation completed in ${yellow().bold(executeTimeMs.toFixed(2))} seconds`));
}

module.exports = initAgent;
