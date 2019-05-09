// Require Node.js Dependencies
const { strictEqual } = require("assert").strict;
const { rename } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const { createDirectory } = require("@slimio/utils");
const { yellow, bold } = require("kleur");
const Spinner = require("@slimio/async-cli-spinner");

// Require Internal Dependencies
const {
    githubDownload,
    installAgentDep,
    installAddon
} = require("../src/utils");

// CONSTANT
const BUILT_IN_ADDONS = ["Events", "Socket", "Gate"];

async function initAgent(init) {
    const promises = [];
    console.log(yellow().bold("Initialize new SlimIO Agent!"));
    strictEqual(init.length !== 0, true, new Error("directoryName length must be 1 or more"));

    const agentDir = join(process.cwd(), init);
    {
        const dirName = await githubDownload("SlimIO.Agent");
        await rename(dirName, agentDir);

        console.log(`Agent has been cloned from GitHub with dir name ${yellow(init)}`);
    }


    // install built-in addons
    const addonDir = join(agentDir, "addons");
    await createDirectory(addonDir);
    console.log(yellow().bold("Addons folder created"));
    console.log();

    console.log(`Starting ${yellow("installing Built-in addons")} & ${yellow("install Agent dependencies")}`);

    promises.push(Spinner.create(installAgentDep, agentDir));
    for (const addonName of BUILT_IN_ADDONS) {
        promises.push(Spinner.create(installAddon, addonName, addonDir));
    }


    // setImmediate(async() => {
    await Spinner.startAll(promises);
    // const results = await Promise.all(promises);
    // });
    // for (let ind = 0; ind < BUILT_IN_ADDONS.length; ind++) {
    //     console.log(BUILT_IN_ADDONS[ind]);
    //     console.log(results[ind]);
    // }
}

module.exports = initAgent;
