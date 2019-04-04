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
        Manifest.create({
            name: "Agent",
            version: "0.1.0",
            type: "Package"
        });
    }
    else {
        throw new Error("answers.createFile must be addon|manifest");
    }

    console.log(createFile);
}

module.exports = create;
