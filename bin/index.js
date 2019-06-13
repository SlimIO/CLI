#!/usr/bin/env node
require("make-promises-safe");
const { join } = require("path");
const dotenv = require("dotenv").config({ path: join(__dirname, "..", ".env") });

// Require Third-party Dependencies
const { parseArg, argDefinition, help } = require("@slimio/arg-parser");
const { white } = require("kleur");
const sade = require("sade");

// Require Internal Dependencies
const commands = require("../commands");

const prog = sade("slimio");
prog
    .version("1.0.0");

prog
    .command("init [dirName]")
    .describe("Initialize a new SlimIO Agent")
    .option("-a , --addon", "List to add addons with initialization")
    .action(async(dirName = "agent", opts) => {
        const addons = opts.a.split(",");
        await commands.initAgent(dirName, addons);
    });

prog
    .command("add [addons]")
    .describe("Add an addon to the agent")
    .option("-n", "Non-Actif addons")
    .action(async(addons, options) => {
        const opts = typeof options.n === "undefined" ? [] : options.n.split(",");
        const adds = typeof addons === "undefined" ? [] : addons.split(",");

        await commands.addAddon(adds, opts);
    });

prog
    .command("create")
    .describe("Create bunch of files for the agent")
    .action(async() => {
        await commands.create(void 0, void 0);
    });

prog
    .command("service")
    .describe("Create an agent service")
    .action(async() => {
        await commands.service(argv.get("service"));
    });

prog
    .command("build")
    .describe("Build the agent")
    .action(async() => {
        await commands.build(argv.get("type"));
    });

prog
    .command("connect [agent]")
    .describe("Build the agent")
    .action(async(agent = "localhost:1337") => {
        const [host, port] = agent.split(":");
        await commands.connectAgent({ host, port: Number(port) });
    });

prog.parse(process.argv);
/** @type {ArgParser.ArgvResult<CLI.argv>} */
// let argv;
// {
//     // Retrieve Script arguments
//     const argDefs = [
//         argDefinition("-i --init [string=agent]", "Initialize a new SlimIO Agent"),
//         argDefinition("-a --add [array]", "Add an addon to the agent"),
//         argDefinition("--create", "Create bunch of files for the agent"),
//         argDefinition("-s --service [string=add]", "Create an agent service"),
//         argDefinition("--addons [array]", "A list of addons"),
//         argDefinition("-b --build", "Build the agent"),
//         argDefinition("-t --type [string=core]", "type for build"),
//         argDefinition("-c --connect [string=localhost:1337]", "Connect CLI to a local or remote SlimIO Agent"),
//         argDefinition("-h --help", "Show help")
//     ];

//     argv = parseArg(argDefs);
//     if (argv.get("help")) {
//         help(argDefs);
//         process.exit(0);
//     }
//     argv.delete("help");
// }

// // Current working dir
// if (process.cwd() === __dirname) {
//     process.exit(0);
// }

/**
 * @async
 * @func main
 * @returns {Promise<void>}
 */
async function main() {
    // console.log(`\n > Executing SlimIO CLI at: ${white().bold(process.cwd())}\n`);
    // if (argv.has("init")) {
    //     const addons = argv.get("addons");
    //     await commands.initAgent(argv.get("init"), addons);
    // }
    // else if (argv.has("add")) {
    //     await commands.addAddon(argv.get("add"));
    // }
    // else if (argv.get("create")) {
    //     await commands.create(void 0, void 0);
    // }
    // else if (argv.has("service")) {
    //     await commands.service(argv.get("service"));
    // }
    // else if (argv.has("connect")) {
    //     const [host, port] = argv.get("connect").split(":");
    //     await commands.connectAgent({ host, port: Number(port) });
    // }
    // else if (argv.has("build")) {
    //     await commands.build(argv.get("type"));
    // }
}
main().catch(console.error);
