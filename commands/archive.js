"use strict";

// Require Node.js Dependencies
const { access, mkdir } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const bundler = require("@slimio/bundler");
const Manifest = require("@slimio/manifest");
const qoa = require("qoa");
const { red, yellow, white, cyan } = require("kleur");

// Require Internal Dependencies
const { checkBeInAgentOrSubDir, checkBeInAgentDir } = require("../src/utils");
const { getLocalAddons } = require("../src/agent");

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
    if (type !== "Addon" && name !== "agent") {
        console.log(red().bold("Current working dir as not been detected as an Addon!"));
        process.exit(0);
    }

    if (name === "agent") {
        const localAddons = await getLocalAddons();
        const { addonName } = await qoa.interactive({
            query: "For which addon(s) do you want to generate an archive ?",
            handle: "addonName",
            menu: [...localAddons]
        });
        console.log("");

        await createAddonArchive(process.cwd(), join(process.cwd(), "build"), addonName);
    }
    else {
        const rootAgent = join(process.cwd(), "..", "..");
        process.chdir(rootAgent);
        checkBeInAgentDir();

        await createAddonArchive(process.cwd(), join(rootAgent, "build"), name);
    }
}

module.exports = archive;
