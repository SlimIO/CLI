// Require Node.js Dependencies
const { strictEqual } = require("assert").strict;
const { rename } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const { createDirectory } = require("@slimio/utils");


// Require Internal Dependencies
const {
    githubDownload,
    npmInstall
} = require("../utils");


const builtInAddons = ["Events", "Socket", "Addon-Agent"];

async function initAgent(init) {
    console.log(": Initialize new SlimIO Agent!");
    strictEqual(init.length !== 0, true, new Error("directoryName length must be 1 or more"));

    const agentDir = join(process.cwd(), init);
    {
        const dirName = await githubDownload("SlimIO.Agent");
        await rename(dirName, agentDir);

        console.log(`Agent - Installed with name ${init}`);

        process.chdir(agentDir);
        console.log("> npm install");

        npmInstall(process.cwd());
        console.log();
    }


    // install built-in addons
    const addonsDir = join(agentDir, "addons");
    await createDirectory(addonsDir);

    console.log("Starting installing Built-in addons");
    for (const addonName of builtInAddons) {
        const dirName = await githubDownload(`SlimIO.${addonName}`);

        const addonDir = join(addonsDir, addonName);
        await rename(dirName, addonDir);

        console.log(`Addon ${addonName} has been cloned from GitHub`);

        process.chdir(addonDir);
        console.log("> npm install");

        npmInstall(process.cwd());
    }
}

module.exports = initAgent;
