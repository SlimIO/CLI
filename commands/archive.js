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
const { getToken } = require("../src/i18n");

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
        white().bold(getToken("archive_creating_success", cyan().bold(addonName), yellow().bold(location)))
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
        console.log(red().bold(getToken("archive_workdir_not_addon")));
        process.exit(0);
    }

    if (name === "agent") {
        const localAddons = await getLocalAddons();
        const { addonName } = await qoa.interactive({
            query: getToken("archive_addon_archive"),
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
