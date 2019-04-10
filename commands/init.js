// Require Node.js Dependencies
const { strictEqual } = require("assert").strict;
const { rename } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const { createDirectory } = require("@slimio/utils");
const Manifest = require("@slimio/manifest");


// Require Internal Dependencies
const {
    githubDownload,
    npmInstall,
    npmCI,
    renameDirFromManifest
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

        npmCI(process.cwd());
        console.log();
    }


    // install built-in addons
    await createDirectory(join(agentDir, "addons"));
    process.chdir("addons");

    console.log("Starting installing Built-in addons");
    for (const addonName of builtInAddons) {
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
