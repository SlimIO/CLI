// Require Node.js Dependencies
const { join } = require("path");
const { readFile } = require("fs").promises;

// Require Third-party Dependencies
const qoa = require("qoa");
const Manifest = require("@slimio/manifest");
const { AddonFactory } = require("@slimio/addon-factory");
const is = require("@slimio/is");

// Require Internal Dependencies
const { fileExist, checkBeInAgentDir } = require("../src/utils");

// CONSTANTS
const E_TYPES = new Set(["Addon", "Manifest"]);

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
            checkBeInAgentDir();
            process.chdir("addons");

            if (is.string(config.name)) {
                await (new AddonFactory(config.name)).generate(process.cwd());
                break;
            }
            const { addonName } = await qoa.prompt([
                {
                    type: "input",
                    query: "Give a name for the Addon",
                    handle: "addonName"
                }
            ]);

            await (new AddonFactory(addonName)).generate(process.cwd());
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

            Manifest.create(options, join(process.cwd(), "slimio.toml"), true);
            break;
        }
    }
}

module.exports = create;
