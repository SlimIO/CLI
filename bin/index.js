#!/usr/bin/env node

// Require Node.js Dependencies
const { spawnSync } = require("child_process");
const { strictEqual } = require("assert").strict;

// Require Third-party Dependencies
const commander = require("commander");

// Retrieve Script arguments!
const argv = commander
    .version("0.1.0")
    .option("-i, --init <directoryName>", "Initialize a new SlimIO Agent")
    .option("-c, --connect <tcpPort>", "Establish connection to a SlimIO Agent")
    .parse(process.argv);

const { init } = argv;

// Current working dir
const cwd = process.cwd();
console.log(`Executing script at: ${cwd}`);

// If init command has been asked!
if (typeof init === "string") {
    console.log(": Initialize new SlimIO Agent!");
    strictEqual(init.length !== 0, true, new Error("directoryName length must be 1 or more"));

    // TODO: Download github repository
}

// TODO: Connect to agent
