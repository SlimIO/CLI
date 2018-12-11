#!/usr/bin/env node

// Require Node.js Dependencies
const { spawnSync } = require("child_process");
const { rename } = require("fs").promises;
const { join } = require("path");
const { strictEqual } = require("assert").strict;

// Require Third-party Dependencies
const commander = require("commander");
const download = require("@slimio/github");
const inquirer = require("inquirer");

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

function askForAuthentification() {
    return inquirer.prompt([
        { type: "input", name: "username", message: "Github username: " },
        { type: "password", name: "password", message: "Github password: " }
    ]);
}

async function main() {
    // If init command has been asked!
    if (typeof init === "string") {
        console.log(": Initialize new SlimIO Agent!");
        strictEqual(init.length !== 0, true, new Error("directoryName length must be 1 or more"));

        const { username, password } = await askForAuthentification();
        const dirName = await download("SlimIO.Agent", {
            auth: `${username}:${password}`,
            extract: true
        });

        const agentDir = join(cwd, init);
        await rename(dirName, agentDir);
    }

    // TODO: Connect to agent
}
main().catch(console.error);
