// Require Node.js Dependencies
const { join } = require("path");
const { createReadStream, promises: { readFile } } = require("fs");

// Require Third-party Dependencies
const qoa = require("qoa");
const Manifest = require("@slimio/manifest");
const { AddonFactory } = require("@slimio/addon-factory");
const is = require("@slimio/is");
const { yellow, white } = require("kleur");

// Require Internal Dependencies
const { fileExist, checkBeInAgentOrAddonDir } = require("../src/utils");

// CONSTANTS
const E_TYPES = new Set(["Addon", "Manifest"]);

async function generateAndLogAddon(name, path) {
    await (new AddonFactory(name)).generate(path);
    console.log(white().bold(`\n--> Default ${yellow().bold(name)} addon created in ${yellow().bold(path)}\n`));
    createReadStream(join(path, name, "index.js")).pipe(process.stdout);
}

async function create(type, config = {}) {
    if (is.nullOrUndefined(type)) {
        const { createFile } = await qoa.prompt([
            {
                type: "interactive",
                query: "What do you want to create ?",
                handle: "createFile",
                menu: ["Addon", "Manifest"]
            }
        ]);
        // eslint-disable-next-line
        type = createFile;
    }
    if (!E_TYPES.has(type)) {
        throw new Error(`Unknown type '${type}'`);
    }

    switch (type) {
        case "Addon": {
            checkBeInAgentOrAddonDir();
            const path = join(process.cwd(), "addons");
            if (is.string(config.name)) {
                await generateAndLogAddon(config.name, path);
                break;
            }
            const { addonName } = await qoa.prompt([
                {
                    type: "input",
                    query: "Give a name for the Addon:",
                    handle: "addonName"
                }
            ]);
            await generateAndLogAddon(addonName, path);
            break;
        }
        case "Manifest": {
            await fileExist("slimio.toml");

            let tomlType = config.type;
            if (!Reflect.has(config, "type")) {
                const res = await qoa.prompt([
                    {
                        type: "interactive",
                        query: "Choose the project type",
                        handle: "type",
                        menu: [...Manifest.TYPES]
                    }
                ]);
                tomlType = res.type;
            }

            const buf = await readFile(join(process.cwd(), "package.json"));
            const { name, version } = JSON.parse(buf.toString());

            const realName = name.charAt(0) === "@" ? name.split("/")[1] : name;
            const options = { name: realName, version, type: tomlType };
            const path = join(process.cwd(), "slimio.toml");
            Manifest.create(options, path, true);
            console.log(white().bold(`Manifest slimio.toml created in ${yellow().bold(process.cwd())}\n`));
            createReadStream(path).pipe(process.stdout);
            break;
        }
    }
}

module.exports = create;
