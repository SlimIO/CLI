#!/usr/bin/env node
require("make-promises-safe");
const dotenv = require("dotenv").config({ path: `${__dirname}/.env` });
if (dotenv.error) {
    throw dotenv.error;
}

// Require Node.js Dependencies
const { rename } = require("fs").promises;
const { join } = require("path");
const { strictEqual } = require("assert").strict;

// Require Third-party Dependencies
const { parseArg, argDefinition, help } = require("@slimio/arg-parser");
const { createDirectory } = require("@slimio/utils");
const download = require("@slimio/github");
const inquirer = require("inquirer");

const builtInAddons = ["Events", "Socket"];

/** @type {ArgParser.ArgvResult<CLI.argv>} */
let argv;
{
    // Retrieve Script arguments
    const argDefs = [
        argDefinition("-i --init [string]", "Initialize a new SlimIO Agent"),
        argDefinition("-a --add [string]", "Add an addon to the agent"),
        argDefinition("-c --connect [number]", "Connect CLI to a local or remote SlimIO Agent"),
        argDefinition("-h --help", "Show help")
    ];

    argv = parseArg(argDefs);
    if (argv.get("help")) {
        help(argDefs);
        process.exit(0);
    }
    argv.delete("help");
}

const init = argv.get("init");
const add = argv.get("add");

// Current working dir
const cwd = process.cwd();
if (cwd === __dirname) {
    process.exit(0);
}

console.log(`Executing script at: ${cwd}`);

async function main() {
    if (typeof init === "string") {
        console.log(": Initialize new SlimIO Agent!");
        strictEqual(init.length !== 0, true, new Error("directoryName length must be 1 or more"));

        let agentDir;
        {
            const dirName = await download("SlimIO.Agent", {
                auth: process.env.AUTH,
                extract: true
            });

            agentDir = join(cwd, init);
            await rename(dirName, agentDir);

            console.log(`Agent installed with name ${init}`);
        }


        // install built-in addons
        const addonsDir = join(agentDir, "addons");
        await createDirectory(addonsDir);

        console.log();
        process.chdir(addonsDir);

        console.log("Starting installing Built-in addons");
        for (const addonName of builtInAddons) {
            const dirName = await download(`SlimIO.${addonName}`, {
                auth: process.env.AUTH,
                extract: true
            });

            const addonDir = join(addonsDir, addonName);
            await rename(dirName, addonDir);

            console.log(`Addon ${addonName} installed`);
        }
        process.chdir("../..");
    }

    // TODO: Connect to agent
}
main().catch(console.error);
