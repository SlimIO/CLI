"use strict";

// Require Third-party Dependencies
const qoa = require("qoa");
const { grey, yellow, white, cyan, red, green } = require("kleur");
const levenshtein = require("fast-levenshtein");
const is = require("@slimio/is");
const cacache = require("cacache");
const prettyJSON = require("@slimio/pretty-json");

// CONSTANTS
const CACHE_PATH = "/tmp/slimio-cli";
const DEFAULT_JSON_TAB = 4;

// Symbols
const symJSON = Symbol("symJSON");
const symTAB = Symbol("symTAB");

class REPL {
    /**
     * @class REPL
     * @memberof REPL#
     */
    constructor() {
        this.commands = new Map();
        Object.defineProperty(this, symJSON, { value: false, writable: true });
        Object.defineProperty(this, symTAB, { value: DEFAULT_JSON_TAB, writable: true });

        this.addCommand("help", "display all available commands in the REPL");
        this.addCommand("quit", "exit the current REPL");
        this.addCommand("json", "enable or disable json output");
    }

    /**
     * @member {boolean} json
     * @memberof REPL#
     * @returns {boolean}
     */
    get json() {
        return this[symJSON];
    }

    /**
     * @function addCommand
     * @memberof REPL#
     * @param {!string} name command name
     * @param {string} [description=""] command description
     * @param {*} handler handler
     * @returns {this}
     */
    addCommand(name, description = "", handler) {
        if (!is.string(name)) {
            throw new TypeError("name must be a string");
        }
        if (!is.string(description)) {
            throw new TypeError("description must be a string");
        }
        this.commands.set(name, { description, handler });

        return this;
    }

    /**
     * @function showAvailableCommands
     * @memberof REPL#
     * @returns {void}
     */
    showAvailableCommands() {
        console.log(`\n${white().bold("available commands")}`);
        for (const [name, options] of this.commands.entries()) {
            const flySpace = 10 - name.length;
            console.log(`${cyan().bold(name)}${" ".repeat(flySpace)} ${options.description}`);
        }
        console.log();
    }

    /**
     * @async
     * @function callHandler
     * @memberof REPL#
     * @param {!string} name command name
     * @param {object} [ctx] context
     * @returns {Promise<any>}
     */
    async callHandler(name, ctx = {}) {
        if (!this.commands.has(name)) {
            return void 0;
        }
        const { handler } = this.commands.get(name);

        return handler(ctx);
    }

    /**
     * @function stdout
     * @memberof REPL#
     * @param {any} obj obj
     * @param {boolean} [addSpace=false] addSpace
     * @returns {void}
     */
    stdout(obj, addSpace = false) {
        if (addSpace) {
            console.log("");
        }
        if (this[symJSON]) {
            console.log(JSON.stringify(obj, null, this[symTAB]));
        }
        else if (typeof obj === "object" && obj !== null) {
            prettyJSON(obj);
        }
        else {
            console.log(obj);
        }

        if (addSpace) {
            console.log("");
        }
    }

    /**
     * @async
     * @function init
     * @memberof REPL#
     * @param {!string} title REPL title
     * @param {object} ctx Command context
     * @returns {Promise<void>}
     */
    async init(title = grey(" > "), ctx = {}) {
        try {
            const jsonStdout = await cacache.get(CACHE_PATH, "json_stdout");
            this[symJSON] = jsonStdout.data.toString().trim().toLowerCase() === "true";
        }
        catch (err) {
            // Ignore
        }

        try {
            const jsonStdout = await cacache.get(CACHE_PATH, "json_tab");
            const value = Number(jsonStdout.data.toString());
            if (!Number.isNaN(value)) {
                this[symTAB] = value;
            }
        }
        catch (err) {
            // Ignore
        }

        replWhile: while (true) {
            let { command } = await qoa.prompt([{
                type: "input", query: title, handle: "command"
            }]);
            command = command.trim().normalize();
            const [first, ...args] = command.split(" ");

            if (!this.commands.has(first)) {
                const isMatching = [];
                for (const item of this.commands.keys()) {
                    const count = levenshtein.get(item, first);
                    if (count <= 2) {
                        isMatching.push(item);
                    }
                }

                console.log(red().bold(`\nUnknown command '${yellow().bold(first)}'`));
                if (isMatching.length > 0) {
                    const words = isMatching.map((row) => cyan().bold(row)).join(",");
                    console.log(white().bold(`Did you mean: ${words} ?\n`));
                }
                continue;
            }

            switch (first) {
                case "help":
                    this.showAvailableCommands();
                    break;
                case "quit":
                    break replWhile;
                case "json": {
                    const state = args[0] || "off";
                    this[symJSON] = state === "on";
                    console.log(`\n${white().bold("JSON output ")} ${green().bold(this[symJSON] ? "Enabled" : "Disabled")}\n`);

                    break;
                }
                default: {
                    await this.callHandler(first, Object.assign({}, ctx, { args }));
                    break;
                }
            }
        }
        console.log(`REPL Connection to ${title} closed\n`);
    }
}

module.exports = REPL;
