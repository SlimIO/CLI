#!/usr/bin/env node
require("make-promises-safe");
const { join } = require("path");
const dotenv = require("dotenv").config({ path: join(__dirname, "..", ".env") });
if (dotenv.error) {
    throw dotenv.error;
}

// Require Third-party Dependencies
const { parseArg, argDefinition, help } = require("@slimio/arg-parser");
const { white } = require("kleur");

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
        argDefinition("-s --service [string=add]", "Create an agent service"),
        argDefinition("--addons [array]", "A list of addons"),
        argDefinition("-b --build", "Build the agent"),
        argDefinition("-t --type [string=core]", "type for build"),
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
if (process.cwd() === __dirname) {
    process.exit(0);
}

/**
 * @async
 * @func main
 * @returns {Promise<void>}
 */
async function main() {
    console.log(`\n > Executing SlimIO CLI at: ${white().bold(process.cwd())}\n`);
    if (argv.has("init")) {
        const addons = argv.get("addons");
        await commands.initAgent(argv.get("init"), addons);
    }
    else if (argv.has("add")) {
        await commands.addAddon(argv.get("add"));
    }
    else if (argv.get("create")) {
        await commands.create(void 0, void 0);
    }
    else if (argv.has("service")) {
        await commands.service(argv.get("service"));
    }
    else if (argv.has("connect")) {
        const [host, port] = argv.get("connect").split(":");
        await commands.connectAgent({ host, port: Number(port) });
    }
    else if (argv.has("build")) {
        await commands.build(argv.get("type"));
    }
}
main().catch(console.error);
