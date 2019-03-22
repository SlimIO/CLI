#!/usr/bin/env node
require("make-promises-safe");
require("dotenv").config();

// Require Node.js Dependencies
const { rename } = require("fs").promises;
const { join } = require("path");
const { strictEqual } = require("assert").strict;

// Require Third-party Dependencies
const { parseArg, argDefinition, help } = require("@slimio/arg-parser");
const download = require("@slimio/github");
const inquirer = require("inquirer");

/** @type {ArgParser.ArgvResult<CLI.argv>} */
let argv;
{
    // Retrieve Script arguments!
    const argDefs = [
        argDefinition("-i --init [string]", "Initialize a new SlimIO Agent"),
        argDefinition("-c --connect [number]", "Connect CLI to a local or remote SlimIO Agent"),
        argDefinition("-h --help", "Show help")
    ];

    argv = parseArg(argDefs);
    if (argv.get("help")) {
        help(argDefs);
    }
    argv.delete("help");
}


const init = argv.get("init");

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

        const dirName = await download("SlimIO.Agent", {
            auth: process.env.AUTH,
            extract: true
        });

        const agentDir = join(cwd, init);
        await rename(dirName, agentDir);
    }

    // TODO: Connect to agent
}
main().catch(console.error);
