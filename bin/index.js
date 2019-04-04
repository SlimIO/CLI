#!/usr/bin/env node
require("make-promises-safe");
const dotenv = require("dotenv").config({ path: `${__dirname}/.env` });
if (dotenv.error) {
    throw dotenv.error;
}

// Require Third-party Dependencies
const { parseArg, argDefinition, help } = require("@slimio/arg-parser");

// Require Internal Dependencies
const {
    initAgent,
    addAddon,
    create,
    connectAgent
} = require("../commands");


/** @type {ArgParser.ArgvResult<CLI.argv>} */
let argv;
{
    // Retrieve Script arguments
    const argDefs = [
        argDefinition("-i --init [string=agent]", "Initialize a new SlimIO Agent"),
        argDefinition("-a --add [string]", "Add an addon to the agent"),
        argDefinition("--create", "Create bunch of files for the agent"),
        argDefinition("-c --connect [number=1337]", "Connect CLI to a local or remote SlimIO Agent"),
        argDefinition("-h --help", "Show help")
    ];

    argv = parseArg(argDefs);
    if (argv.get("help")) {
        help(argDefs);
        process.exit(0);
    }
    argv.delete("help");
}

console.log(argv);

const init = argv.get("init");
const add = argv.get("add");
const connect = argv.get("connect");

// Current working dir
const cwd = process.cwd();
if (cwd === __dirname) {
    process.exit(0);
}

console.log(`Executing script at: ${cwd}`);

async function main() {
    if (typeof init === "string") {
        await initAgent(init);

        return;
    }

    if (typeof add === "string") {
        await addAddon(add);

        return;
    }

    if (argv.has("create") === true) {
        create();

        return;
    }

    if (typeof connect === "number") {
        connectAgent(connect);
    }
}
main().catch(console.error);
