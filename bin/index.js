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

// eslint-disable-next-line
const splitOnComma = (arg) => typeof arg === "string" ? arg.split(",") : [];

const prog = sade("slimio").version("0.3.0");

prog
    .command("init [agentDirectoryName]")
    .describe("Clone and install a complete SlimIO Agent")
    .option("-a, --add", "Additional addons to install in addition to the built-in")
    .option("-s, --set", "choose a given set of addons", null)
    .option("-i, --interactive", "enable interactive mode", false)
    .example("init --add ihm,cpu-addon")
    .example("init myAgent")
    .action(async(agentDirectoryName = "agent", { add, set, interactive }) => {
        await commands.initAgent(agentDirectoryName, {
            addons: splitOnComma(add),
            set,
            interactive
        });
    });

// TODO: add alias install (when sade alias RFC land)
prog
    .command("add [addons]")
    .describe("Add one or many addon(s) to the local agent (Addon are enabled by default).")
    .option("-d, --disabled", "Write addons as active: false in agent.json", false)
    .option("-i, --interactive", "enable interactive mode", false)
    .action(async(addons, { disabled, interactive }) => {
        await commands.add(splitOnComma(addons), {
            disabled: Boolean(disabled),
            interactive
        });
    });

// TODO: add alias rm, uninstall (when sade alias RFC land)
prog
    .command("remove [addons]")
    .option("-i, --interactive", "enable interactive mode", false)
    .describe("Remove one or many addons from the local agent (Erase them from the disk)")
    .action(async(addons, { interactive }) => {
        await commands.remove(splitOnComma(addons), { interactive });
    });

prog
    .command("create [type]")
    .describe("Create/generate SlimIO files and addons")
    .option("-n, --name", "Addon name (only when Addon type is Addon)")
    .action(async(type, opts) => {
        const config = {};
        if (typeof opts.name === "string") {
            config.name = opts.name;
        }
        await commands.create(type, config);
    });

prog
    .command("build")
    .describe("Build and compile an agent into an executable with Node.js bundled in it")
    .action(async() => {
        await commands.build();
    });

prog
    .command("archive [addonName]")
    .describe("Create an addon archive")
    .action(async(addonName) => {
        await commands.archive(addonName);
    });

prog
    .command("connect [agent]")
    .describe("Connect to a local or remote running agent")
    .example("connect localhost:1433")
    .action(async(agent = "localhost:1337") => {
        const [host, port] = agent.split(":");
        await commands.connectAgent({ host, port: Number(port) });
    });

prog
    .command("config [cmd] [addon]")
    .describe("Configure a local agent or a remote running agent")
    .example("config enable ihm,cpu")
    .example("config sync")
    .action(async(cmd, addon) => {
        await commands.configure(cmd, addon);
    });

prog
    .command("debug")
    .describe("debug (navigate through local agent dump files)")
    .option("-c, --clear", "clear dump files", false)
    .action(async(options) => {
        await commands.debug(Boolean(options.clear));
    });

prog
    .command("start")
    .describe("start the local agent and enable/unlock advanced debug tools")
    .action(async() => {
        await commands.start();
    });

prog
    .command("set <key> <value>")
    .describe("Setup a new settings in the local cache")
    .example("set json_tab 4")
    .example("set json_stdout on")
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

const fsk = [...SETTINGS_KEYS].join("\n\t- ");
prog
    .command("get [key]")
    .describe(`Get one or all keys stored in the local cache (return all keys if no argument is given).
     Available settings keys are: \n\t- ${fsk}`)
    .example("get json_tab")
    .example("get json_stdout")
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

            console.log(grey().bold(" - Local settings -"));
            prettyJSON(keys);
        }
    });

prog.parse(process.argv);
