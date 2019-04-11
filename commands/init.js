// Require Node.js Dependencies
const { strictEqual } = require("assert").strict;
const { rename } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const { createDirectory } = require("@slimio/utils");

// Require Internal Dependencies
const {
    githubDownload,
    npmInstall,
    npmCI,
    renameDirFromManifest
} = require("../src/utils");

// CONSTANT
const BUILT_IN_ADDONS = ["Events", "Socket", "Addon-Agent"];

async function initAgent(init) {
    console.log(": Initialize new SlimIO Agent!");
    strictEqual(init.length !== 0, true, new Error("directoryName length must be 1 or more"));

    const agentDir = join(process.cwd(), init);
    {
        const dirName = await githubDownload("SlimIO.Agent");
        await rename(dirName, agentDir);

        console.log(`Agent has been cloned from GitHub with dir name ${init}`);

        process.chdir(agentDir);
        console.log("> npm install");

        npmCI(process.cwd());
        console.log();
    }


    // install built-in addons
    await createDirectory(join(agentDir, "addons"));
    process.chdir("addons");

    console.log("Starting installing Built-in addons");
    for (const addonName of BUILT_IN_ADDONS) {
        const dirName = await githubDownload(`SlimIO.${addonName}`);
        const addonDir = await renameDirFromManifest(dirName);

        console.log(`Addon ${addonName} has been cloned from GitHub`);

        process.chdir(addonDir);
        console.log("> npm install");

        npmInstall(process.cwd());
        process.chdir("..");
    }
}

module.exports = initAgent;
