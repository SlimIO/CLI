// Require Node.js Dependencies
const { join } = require("path");

// Require Third-party Dependencies
const bundler = require("@slimio/bundler");
const { red, yellow, white, cyan } = require("kleur");
const Manifest = require("@slimio/manifest");
const { createDirectory } = require("@slimio/utils");

// Require Internal Dependencies
const { checkBeInAgentDir } = require("../src/utils");

// CONSTANTS
const E_TYPES = new Set(["core", "addon"]);

async function build(type = "core") {
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
            const man = Manifest.open();
            if (man.type !== "Addon") {
                console.log(red().bold("Current working dir not detected as a Addon!"));

                return;
            }

            // Create ./build directory (on the agent)
            const cwd = process.cwd();
            const buildPath = join(cwd, "..", "..", "build");
            await createDirectory(cwd);
            process.chdir(buildPath);

            try {
                const location = await bundler.createArchive(cwd);
                // eslint-disable-next-line
                console.log(white().bold(`Successfully created ${cyan().bold(man.name)} addon archive at '${yellow().bold(location)}'`));
            }
            finally {
                process.chdir(cwd);
            }

            break;
        }
    }
}

module.exports = build;
