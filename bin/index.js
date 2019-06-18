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
    .describe("Add an addon to the agent (will be activated by default).")
    .option("-d , --disabled", "Add an addon as disabled by default.")
    .action(async(addons, options) => {
        const opts = typeof options.d === "undefined" ? [] : options.d.split(",");
        const adds = typeof addons === "undefined" ? [] : addons.split(",");

        await commands.addAddon(adds, opts);
    });

prog
    .command("create [type]")
    .describe("Create and generate SlimIO Manifest and Addon")
    .option("-n , --name", "Addon name (only when Addon type is Addon)")
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
    .describe("Build the agent or a given addon")
    .option("-t, --type", "Type of build")
    .action(async(options) => {
        await commands.build(options.t);
    });

prog
    .command("connect [agent]")
    .describe("Connect to a local or remote running agent")
    .action(async(agent = "localhost:1337") => {
        const [host, port] = agent.split(":");
        await commands.connectAgent({ host, port: Number(port) });
    });

prog
    .command("configure [cmd] [addon]")
    .describe("Configure a local agent or a remote running agent")
    .action(async(cmd, addon) => {
        await commands.configure(cmd, addon);
    });

prog.parse(process.argv);
