// Require Node.js Dependencies
const { join } = require("path");
const { readFile } = require("fs").promises;
const { strictEqual } = require("assert").strict;

// Require Third-party Dependencies
const qoa = require("qoa");
const Manifest = require("@slimio/manifest");
const { AddonFactory } = require("@slimio/addon-factory");

async function create() {
    // verify instance of Agent of index.js in current dir
    const { createFile } = await qoa.prompt([
        {
            type: "interactive",
            query: "What do you want to create ?",
            handle: "createFile",
            menu: ["Addon", "Manifest"]
        }
    ]);

    if (createFile === "Addon") {
        process.chdir("addons");
        const { addonName } = await qoa.prompt([
            {
                type: "input",
                query: "Give a name for the Addon",
                handle: "addonName"
            }
        ]);
        strictEqual(addonName.length !== 0, true, new Error("Addon name length must be 1 or more"));

        const newAddon = new AddonFactory(addonName);
        await newAddon.generate(process.cwd());
    }
    else if (createFile === "Manifest") {
        console.log("create Manifest !");
        const { name } = await qoa.prompt([
            {
                type: "input",
                query: "Give a name for the Manifest file",
                handle: "name"
            }
        ]);
        strictEqual(name.length !== 0, true, new Error("Manifest name length must be 1 or more"));

        const { type } = await qoa.prompt([
            {
                type: "interactive",
                query: "Choose the project type",
                handle: "type",
                menu: ["Addon", "NAPI", "CLI", "Package"]
            }
        ]);

        const packageJSON = await readFile(join(process.cwd(), "package.json"));
        const { version } = JSON.parse(packageJSON);
        Manifest.create({
            name,
            version,
            type
        }, join(process.cwd(), `${name}.toml`));
    }
    else {
        throw new Error("answers.createFile must be addon|manifest");
    }
}

module.exports = create;
