// Require Node.js Dependencies
const { join } = require("path");
const { readFile, stat } = require("fs").promises;
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
        try {
            const stats = await stat("slimio.toml");
            if (stats.isFile()) {
                throw new Error(`File ${init} already exist`);
            }
        }
        catch (err) {
            if (err.code !== "ENOENT") {
                throw err;
            }
        }

        const { type } = await qoa.prompt([
            {
                type: "interactive",
                query: "Choose the project type",
                handle: "type",
                menu: [...Manifest.TYPES]
            }
        ]);

        const packageJSON = await readFile(join(process.cwd(), "package.json"));

        const { name, version } = JSON.parse(packageJSON);
        const [firstChar] = name;

        let realName = name;
        if (firstChar === "@") {
            realName = name.split("/")[1];
        }
        // remove @slimio from package name
        Manifest.create({
            name: realName,
            version,
            type
        }, join(process.cwd(), "slimio.toml"));
    }
    else {
        throw new Error("answers.createFile must be addon|manifest");
    }
}

module.exports = create;
