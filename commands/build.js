"use strict";

// Require Node.js Dependencies
const { access, mkdir } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const bundler = require("@slimio/bundler");
const { red, yellow, white, cyan } = require("kleur");
const Manifest = require("@slimio/manifest");

// Require Internal Dependencies
const { checkBeInAgentDir, checkBeInAgentOrSubDir } = require("../src/utils");

// CONSTANTS
const E_TYPES = new Set(["core", "addon"]);

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
 * @function build
 * @param {string} [type="core"]
 * @param {string} [addon]
 * @returns {Promise<void>}
 */
async function build(type = "core", addon) {
    if (typeof type !== "string") {
        throw new TypeError("type must be a string");
    }

    // eslint-disable-next-line
    type = type.toLowerCase();
    if (!E_TYPES.has(type)) {
        console.log(red().bold(`Unknown build type '${yellow().bold(type)}'`));
    }

    switch (type) {
        case "core": {
            checkBeInAgentDir();

            try {
                const location = await bundler.generateCoreExecutable(process.cwd(), {
                    debug: true,
                    cwd: join(process.cwd(), "build")
                });
                console.log(white().bold(`\nCore succesfully generated at: ${yellow().bold(location)}`));
            }
            catch (err) {
                console.log(red().bold("Core compilation failed"));
                throw err;
            }
            break;
        }
        case "addon": {
            if (typeof addon === "string") {
                checkBeInAgentOrSubDir();

                const addonDir = join(process.cwd(), "addons", addon);
                await access(addonDir);
                await access(join(addonDir, "index.js"));
                await createAddonArchive(addonDir, join(process.cwd(), "build"), addon);
            }
            else {
                const { type, name } = Manifest.open();
                if (type === "Addon") {
                    await createAddonArchive(process.cwd(), join(process.cwd(), "..", "..", "build"), name);
                }
                else {
                    console.log(red().bold("Current working dir not detected as an Addon!"));
                }
            }
            break;
        }
    }
}

module.exports = build;
