// Require Third-party Dependencies
const qoa = require("qoa");
const { grey, yellow, white, cyan, red } = require("kleur");
const levenshtein = require("fast-levenshtein");
const is = require("@slimio/is");

/**
 * @class REPL
 */
class REPL {
    /**
     * @constructor
     * @memberof REPL#
     */
    constructor() {
        this.commands = new Map();
        this.addCommand("help", "display all available commands in the REPL");
        this.addCommand("quit", "exit the current REPL");
    }

    /**
     * @method addCommand
     * @memberof REPL#
     * @param {!String} name command name
     * @param {String} [description=""] command description
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
     * @method showAvailableCommands
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
     * @method callHandler
     * @memberof REPL#
     * @param {!String} name command name
     * @param {Object=} ctx context
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
     * @async
     * @method init
     * @memberof REPL#
     * @param {!String} title REPL title
     * @param {Object} ctx Command context
     * @returns {Promise<void>}
     */
    async init(title = grey(" > "), ctx = {}) {
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
