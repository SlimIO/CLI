#!/usr/bin/env node
require("make-promises-safe");
const { join } = require("path");
require("dotenv").config({ path: join(__dirname, "..", ".env") });

// Require Third-party Dependencies
const sade = require("sade");

// Require Internal Dependencies
const commands = require("../commands");

const prog = sade("slimio");
prog
    .version("0.1.1");

prog
    .command("init [dirName]")
    .describe("Initialize a new SlimIO Agent")
    .option("-a , --add", "List to add addons with initialization")
    .action(async(dirName = "agent", opts) => {
        const addons = typeof opts.a === "undefined" ? [] : opts.a.split(",");
        await commands.initAgent(dirName, addons);
    });

prog
    .command("add [addons]")
    .describe("Add an addon to the agent")
    .option("-d", "Disabled addons")
    .action(async(addons, options) => {
        const opts = typeof options.d === "undefined" ? [] : options.d.split(",");
        const adds = typeof addons === "undefined" ? [] : addons.split(",");

        await commands.addAddon(adds, opts);
    });

prog
    .command("create [type]")
    .describe("Create bunch of files for the agent")
    .option("-n", "Addon name")
    .action(async(type, opts) => {
        const config = {};
        if (typeof opts.n !== "undefined") {
            Reflect.set(config, "name", opts.n);
        }
        await commands.create(type, config);
    });

prog
    .command("service [action]")
    .describe("Create an agent service")
    .action(async(action) => {
        await commands.service(action);
    });

prog
    .command("build")
    .describe("Build the agent")
    .option("-t, --type", "Type of build")
    .action(async(options) => {
        await commands.build(options.t);
    });

prog
    .command("connect [agent]")
    .describe("Connect to an agent local/remote")
    .action(async(agent = "localhost:1337") => {
        const [host, port] = agent.split(":");
        await commands.connectAgent({ host, port: Number(port) });
    });

prog.parse(process.argv);
