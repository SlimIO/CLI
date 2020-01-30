#!/usr/bin/env node
"use strict";

// Require Node.js Dependencies
const { readdir } = require("fs").promises;
const { join, extname, basename } = require("path");

// Require Third-party Dependencies
require("make-promises-safe");
require("dotenv").config({ path: join(__dirname, "..", ".env") });

const sade = require("sade");
const cacache = require("cacache");
const qoa = require("qoa");
const { red, yellow, white, green, cyan, grey } = require("kleur");
const prettyJSON = require("@slimio/pretty-json");

// Require Internal Dependencies
const { getToken, getLocalLang } = require("../src/i18n");
const commands = require("../commands");

// CONSTANTS
const CACHE_PATH = "/tmp/slimio-cli";
const SETTINGS_KEYS = new Set(["json_tab", "json_stdout", "cli-lang"]);

// eslint-disable-next-line
const splitOnComma = (arg) => typeof arg === "string" ? arg.split(",") : [];

const prog = sade("slimio").version("0.5.0");

prog
    .command("init [agentDirectoryName]")
    .describe(getToken("binary.init_description"))
    .option("-a, --add", getToken("binary.init_opt_add"))
    .option("-s, --set", getToken("binary.init_opt_set"), null)
    .option("-i, --interactive", getToken("binary.opt_interactive"), false)
    .option("--nocache", getToken("binary.init_opt_nocache"), false)
    .example("init --add ihm,cpu-addon")
    .example("init --set metrology")
    .example("init SlimIOAgent")
    .action(async(agentDirectoryName = "agent", { add, set, interactive, nocache }) => {
        await commands.initAgent(agentDirectoryName, {
            addons: splitOnComma(add),
            set,
            interactive,
            nocache
        });
    });

prog
    .command("add [addons]", void 0, {
        alias: ["install"]
    })
    .describe(getToken("binary.add_description"))
    .option("-d, --disabled", getToken("binary.add_opt_disabled"), false)
    .option("-i, --interactive", getToken("binary.opt_interactive"), false)
    .example("add ihm,prism")
    .example("add --interactive --disabled")
    .action(async(addons, { disabled, interactive }) => {
        await commands.add(splitOnComma(addons), {
            disabled: Boolean(disabled),
            interactive
        });
    });

prog
    .command("remove [addons]", void 0, {
        alias: ["uninstall", "rm"]
    })
    .describe(getToken("binary.remove_description"))
    .option("-i, --interactive", getToken("binary.opt_interactive"), false)
    .example("remove ihm")
    .action(async(addons, { interactive }) => {
        await commands.remove(splitOnComma(addons), { interactive });
    });

prog
    .command("create [type]")
    .describe(getToken("binary.create_description"))
    .option("-n, --name", getToken("binary.create_opt_name"))
    .example("create --name myFirstAddon")
    .action(async(type, opts) => {
        const config = {};
        if (typeof opts.name === "string") {
            config.name = opts.name;
        }
        await commands.create(type, config);
    });

prog
    .command("build")
    .describe(getToken("binary.build_description"))
    .action(async() => {
        await commands.build();
    });

prog
    .command("archive [addonName]")
    .describe(getToken("binary.archive_description"))
    .action(async(addonName) => {
        await commands.archive(addonName);
    });

prog
    .command("connect [agent]")
    .describe(getToken("binary.connect_description"))
    .example("connect localhost:1433")
    .action(async(agent = "localhost:1337") => {
        const [host, port] = agent.split(":");
        await commands.connectAgent({ host, port: Number(port) });
    });

prog
    .command("config [cmd] [addon]")
    .describe(getToken("binary.config_description"))
    .example("config enable ihm,cpu")
    .example("config sync")
    .action(async(cmd, addon) => {
        await commands.configure(cmd, addon);
    });

prog
    .command("schema [addon]")
    .describe(getToken("binary.schema_description"))
    .example("config socket")
    .action(async(addon) => {
        await commands.schema(addon);
    });

prog
    .command("debug")
    .describe(getToken("binary.debug_description"))
    .option("-c, --clear", getToken("binary.debug_opt_clear"), false)
    .action(async(options) => {
        await commands.debug(Boolean(options.clear));
    });

prog
    .command("start")
    .describe(getToken("binary.start_description"))
    .action(async() => {
        await commands.start();
    });

prog
    .command("lang")
    .describe(getToken("binary.lang_description"))
    .action(async() => {
        const currentLang = getLocalLang();
        const dirents = await readdir(join(__dirname, "../src/i18n"), { withFileTypes: true });
        const langs = dirents
            .filter((dirent) => dirent.isFile() && extname(dirent.name) === ".js")
            .filter((dirent) => dirent.name !== "index.js")
            .map((dirent) => basename(dirent.name, ".js"));

        langs.splice(langs.indexOf(currentLang), 1);
        langs.unshift(currentLang);

        console.log("");
        const { selectedLang } = await qoa.interactive({
            query: green().bold(` ${getToken("binary.lang_selection")}`),
            handle: "selectedLang",
            menu: langs
        });

        await cacache.put(CACHE_PATH, "cli-lang", selectedLang);
        console.log(white().bold(`\n ${getToken("binary.lang_registration", yellow().bold(selectedLang))}`));
    });

prog
    .command("set <key> <value>")
    .describe(getToken("binary.set_description"))
    .example("set json_tab 4")
    .example("set json_stdout on")
    .action(async(key, value) => {
        console.log("");
        if (!SETTINGS_KEYS.has(key)) {
            const unknownToken = getToken("binary.set_unknown_settings", yellow().bold(key));
            console.log(red().bold(` > ${unknownToken}`));
            console.log(white().bold(`\n${getToken("binary.set_available_keys")}:`));
            prettyJSON([...SETTINGS_KEYS]);

            return;
        }

        await cacache.put(CACHE_PATH, key, value);
        const msgToken = getToken("binary.set_success_write", green().bold(key), cyan().bold(value));
        console.log(white().bold(msgToken));
    });

prog
    .command("get [key]")
    .describe(getToken("binary.get_description", [...SETTINGS_KEYS].join("\n\t- ")))
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

            console.log(grey().bold(` ${getToken("binary.get_settings")}`));
            prettyJSON(keys);
        }
    });

prog.parse(process.argv);
