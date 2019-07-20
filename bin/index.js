#!/usr/bin/env node
"use strict";

require("make-promises-safe");
const { join } = require("path");
require("dotenv").config({ path: join(__dirname, "..", ".env") });

// Require Third-party Dependencies
const sade = require("sade");
const cacache = require("cacache");
const { red, yellow, white, green, cyan, grey } = require("kleur");
const prettyJSON = require("@slimio/pretty-json");

// Require Internal Dependencies
const commands = require("../commands");

// CONSTANTS
const CACHE_PATH = "/tmp/slimio-cli";
const SETTINGS_KEYS = new Set(["json_tab", "json_stdout"]);

const prog = sade("slimio").version("0.2.0");

prog
    .command("init [dirName]")
    .describe("Initialize a new SlimIO Agent")
    .option("-a , --add", "List to add addons with initialization")
    .action(async(dirName = "agent", opts) => {
        const additionalAddons = typeof opts.a === "undefined" ? [] : opts.a.split(",");
        await commands.initAgent(dirName, { additionalAddons });
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

// prog
//     .command("service [action]")
//     .describe("Create an agent service")
//     .action(async(action) => {
//         await commands.service(action);
//     });

prog
    .command("build")
    .describe("Build the agent or a given addon")
    .option("-a, --addon", "Addon name")
    .option("-t, --type", "Type of build (addon or core)")
    .action(async(options) => {
        await commands.build(options.t, options.a);
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

prog
    .command("start")
    .describe("Start a local agent")
    .action(async() => {
        await commands.start();
    });

prog
    .command("set <key> <value>")
    .describe("Setup a new settings in the local cache")
    .action(async(key, value) => {
        console.log("");
        if (!SETTINGS_KEYS.has(key)) {
            console.log(red().bold(` > Unknown settings key '${yellow().bold(key)}' !`));
            console.log(white().bold("\nAvailable keys are:"));
            prettyJSON([...SETTINGS_KEYS]);

            return;
        }

        await cacache.put(CACHE_PATH, key, value);
        console.log(white().bold(`Successfully writed ${green().bold(key)} = ${cyan().bold(value)} in the local cache!`));
    });

prog
    .command("get [key]")
    .describe("Get one or all keys stored in the local cache")
    .action(async(key) => {
        console.log("");

        if (typeof key === "string") {
            const { data } = await cacache.get(CACHE_PATH, key);
            console.log(white().bold(` ${key}: '${green().bold(data.toString())}'`));
        }
        else {
            const entries = await cacache.ls(CACHE_PATH);
            const keys = {};
            for (const key of Object.keys(entries)) {
                keys[key] = (await cacache.get(CACHE_PATH, key)).data.toString();
            }

            console.log(grey().bold(" - Local settings -\n"));
            prettyJSON(keys);
        }
    });

prog.parse(process.argv);
