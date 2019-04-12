// Require Node.js Dependencies
const { strictEqual } = require("assert").strict;
const { rename } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const { createDirectory } = require("@slimio/utils");
const { yellow, grey } = require("kleur");

// Require Internal Dependencies
const {
    githubDownload,
    npmCI,
    installAddon
} = require("../src/utils");

// CONSTANT
const BUILT_IN_ADDONS = ["Events", "Socket", "Addon-Agent"];

async function initAgent(init) {
    console.log(yellow().bold("Initialize new SlimIO Agent!"));
    strictEqual(init.length !== 0, true, new Error("directoryName length must be 1 or more"));

    const agentDir = join(process.cwd(), init);
    {
        const dirName = await githubDownload("SlimIO.Agent");
        await rename(dirName, agentDir);

        console.log(`Agent has been cloned from GitHub with dir name ${yellow(init)}`);

        process.chdir(agentDir);
        console.log(`${yellow(">")} ${grey("npm install")}`);

        npmCI();
        console.log();
    }


    // install built-in addons
    await createDirectory(join(agentDir, "addons"));
    process.chdir("addons");

    console.log(yellow().bold("Starting installing Built-in addons"));
    for (const addonName of BUILT_IN_ADDONS) {
        await installAddon(addonName);
    }
}

module.exports = initAgent;
