#!/usr/bin/env node
require("make-promises-safe");
const { join } = require("path");
const dotenv = require("dotenv").config({ path: join(__dirname, "..", ".env") });
if (dotenv.error) {
    throw dotenv.error;
}

// Require Third-party Dependencies
const { parseArg, argDefinition, help } = require("@slimio/arg-parser");

// Require Internal Dependencies
const commands = require("../commands");

/** @type {ArgParser.ArgvResult<CLI.argv>} */
let argv;
{
    // Retrieve Script arguments
    const argDefs = [
        argDefinition("-i --init [string=agent]", "Initialize a new SlimIO Agent"),
        argDefinition("-a --add [string]", "Add an addon to the agent"),
        argDefinition("--create", "Create bunch of files for the agent"),
        // argDefinition("-b --build", "Build the agent"),
        argDefinition("-c --connect [string=localhost:1337]", "Connect CLI to a local or remote SlimIO Agent"),
        argDefinition("-h --help", "Show help")
    ];

    argv = parseArg(argDefs);
    if (argv.get("help")) {
        help(argDefs);
        process.exit(0);
    }
    argv.delete("help");
}

// Current working dir
const cwd = process.cwd();
if (cwd === __dirname) {
    process.exit(0);
}

console.log(`Executing script at: ${cwd} \n`);

async function main() {
    if (argv.has("init")) {
        await commands.initAgent(argv.get("init"));

        return;
    }

    if (argv.has("add")) {
        await commands.addAddon(argv.get("add"));

        return;
    }

    if (argv.get("create") === true) {
        await commands.create();

        return;
    }

    // if (argv.get("build") === true) {
    //     await commands.build();

    //     return;
    // }

    if (argv.has("connect")) {
        const [host, port] = argv.get("connect").split(":");
        await commands.connectAgent({ host, port: Number(port) });
    }
}
main().catch(console.error);
