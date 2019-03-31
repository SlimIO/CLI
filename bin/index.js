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
const { spawnSync } = require("child_process");
const repl = require("repl");

// Require Third-party Dependencies
const { parseArg, argDefinition, help } = require("@slimio/arg-parser");
const { createDirectory } = require("@slimio/utils");
const download = require("@slimio/github");
const TcpSdk = require("@slimio/tcp-sdk");
const inquirer = require("inquirer");

// CONSTANTS
const EXEC_SUFFIX = process.platform === "win32";

const TCP_CONNECT_TIMEOUT_MS = 1000;

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
const connect = argv.get("connect");

// Current working dir
const cwd = process.cwd();
if (cwd === __dirname) {
    process.exit(0);
}


function githubDownload(path) {
    return download(path, {
        auth: process.env.AUTH,
        extract: true
    });
}

function npmInstall(cwd) {
    const npmProcess = spawnSync(`npm${EXEC_SUFFIX ? ".cmd" : ""}`, ["install"], { cwd });
    for (const out of npmProcess.output) {
        if (out !== null) {
            console.log(out.toString());
        }
    }
}

console.log(`Executing script at: ${cwd}`);

async function main() {
    if (typeof init === "string") {
        console.log(": Initialize new SlimIO Agent!");
        strictEqual(init.length !== 0, true, new Error("directoryName length must be 1 or more"));

        const agentDir = join(cwd, init);
        {
            const dirName = await githubDownload("SlimIO.Agent");
            await rename(dirName, agentDir);

            console.log(`Agent - Installed with name ${init}`);

            process.chdir(agentDir);
            console.log("> npm install");
            npmInstall(process.cwd());
            // console.log(npmProcess);
            console.log();
        }


        // install built-in addons
        const addonsDir = join(agentDir, "addons");
        await createDirectory(addonsDir);

        console.log("Starting installing Built-in addons");
        for (const addonName of builtInAddons) {
            const dirName = await githubDownload(`SlimIO.${addonName}`);

            const addonDir = join(addonsDir, addonName);
            await rename(dirName, addonDir);

            console.log(`Addon ${addonName} installed`);

            process.chdir(addonDir);
            console.log("> npm install");
            npmInstall(process.cwd());
            // console.log(npmProcess);
        }

        return;
    }

    if (typeof add === "string") {
        process.chdir("addons");
        let myurl;
        try {
            myurl = new URL(add);
        }
        catch (error) {
            const dirName = await githubDownload(`SlimIO.${add}`);
            await rename(dirName, add);
            console.log(`Addon ${addon} installed`);
            process.chdir(addonDir);
            console.log("> npm install");
            npmInstall(process.cwd());

            return;
        }

        const { hostname, pathname } = myurl;

        const spliteHostname = hostname.split(".");
        const ext = spliteHostname.pop();
        const host = spliteHostname.pop();

        if (`${host}.${ext}` !== "github.com") {
            throw new Error("URL hostname must be github.com");
        }
        const [, orga, addon] = pathname.split("/");
        if (orga !== "SlimIO") {
            throw new Error("At this time, organisation must be SlimIO");
        }

        const dirName = await githubDownload(`SlimIO.${addon}`);
        await rename(dirName, addon);
        console.log(`Addon ${addon} installed`);

        process.chdir(addon);
        console.log("> npm install");
        npmInstall(process.cwd());

        return;
    }

    if (typeof connect === "number") {
        const client = new TcpSdk(connect);

        await client.once("connect", TCP_CONNECT_TIMEOUT_MS);

        repl.start(`localhost:${connect}`);
    }
    // TODO: Connect to agent
}
main().catch(console.error);
