"use strict";

// Require Node.js Dependencies
const { access, mkdir } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const bundler = require("@slimio/bundler");
const Manifest = require("@slimio/manifest");
const { red, yellow, white, cyan } = require("kleur");

// Require Internal Dependencies
const { checkBeInAgentOrSubDir, checkBeInAgentDir } = require("../src/utils");

/**
 * @async
 * @function createAddonArchive
 * @param {!string} cwd
 * @param {!string} dest
 * @param {!string} addonName
 * @returns {Promise<void>}
 */
async function createAddonArchive(cwd, dest, addonName) {
    await mkdir(dest, { recursive: true });
    const location = await bundler.generateAddonArchive(cwd, { dest });

    console.log(
        white().bold(`Successfully created ${cyan().bold(addonName)} addon archive at '${yellow().bold(location)}'`)
    );
}

/**
 * @async
 * @function archive
 * @param {string} [addon]
 * @returns {Promise<void>}
 */
async function archive(addon) {
    if (typeof addon === "string") {
        checkBeInAgentOrSubDir();

        const addonDir = join(process.cwd(), "addons", addon);
        await access(addonDir);
        await access(join(addonDir, "index.js"));
        await createAddonArchive(addonDir, join(process.cwd(), "build"), addon);

        return;
    }

    const { type, name } = Manifest.open();
    if (type !== "Addon") {
        console.log(red().bold("Current working dir not detected as an Addon!"));
        process.exit(0);
    }

    // Verify that we are in SlimIO Agent
    const rootAgent = join(process.cwd(), "..", "..");
    process.chdir(rootAgent);
    checkBeInAgentDir();

    await createAddonArchive(process.cwd(), join(rootAgent, "build"), name);
}

module.exports = archive;
