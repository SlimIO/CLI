// Require Node.js Dependencies
const { access } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const bundler = require("@slimio/bundler");
const { red, yellow, white, cyan } = require("kleur");
const Manifest = require("@slimio/manifest");
const { createDirectory } = require("@slimio/utils");

// Require Internal Dependencies
const { checkBeInAgentDir, checkBeInAgentOrAddonDir } = require("../src/utils");

// CONSTANTS
const E_TYPES = new Set(["core", "addon"]);

async function createAddonArchive(cwd, dest, addonName) {
    await createDirectory(dest);
    const location = await bundler.createArchive(cwd, { dest });

    console.log(
        white().bold(`Successfully created ${cyan().bold(addonName)} addon archive at '${yellow().bold(location)}'`)
    );
}

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

            // Create ./build directory
            const cwd = join(process.cwd(), "build");
            await createDirectory(cwd);

            try {
                const location = await bundler.compileCore(process.cwd(), {
                    debug: true, cwd
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
                checkBeInAgentOrAddonDir();

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
