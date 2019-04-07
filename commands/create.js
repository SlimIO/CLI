// Require Node.js Dependencies
const { join } = require("path");
const { readFile } = require("fs").promises;

// Require Third-party Dependencies
const inquirer = require("inquirer");
const Manifest = require("@slimio/manifest");
const { AddonFactory } = require("@slimio/addon-factory");

async function create() {
    // verify instance of Agent of index.js in current dir
    const { createFile } = await inquirer.prompt([
        {
            type: "list",
            message: "What do you want to create ?",
            name: "createFile",
            choices: [
                {
                    name: "Addon",
                    value: "addon"
                },
                {
                    name: "Manifest",
                    value: "manifest"
                }
            ]
        }
    ]);

    if (createFile === "addon") {
        process.chdir("addons");
        const { addonName } = await inquirer.prompt([
            {
                type: "input",
                message: "Give a name for the Addon",
                name: "addonName"
            }
        ]);

        const newAddon = new AddonFactory(addonName);
        await newAddon.generate(process.cwd());
    }
    else if (createFile === "manifest") {
        console.log("create Manifest !");
        const { name, type } = await inquirer.prompt([
            {
                type: "input",
                message: "Give a name for the Manifest file",
                name: "name"
            },
            {
                type: "list",
                message: "Choose the project type",
                name: "type",
                choices: ["Addon", "NAPI", "CLI", "Package"]
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
