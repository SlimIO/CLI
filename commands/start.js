"use strict";

// Require Third-party Dependencies
const Core = require("@slimio/core");
const { white, cyan } = require("kleur");

// Require Internal Dependencies
const { checkBeInAgentDir } = require("../src/utils");

/**
 * @async
 * @function start
 * @returns {Promise<void>}
 */
async function start() {
    checkBeInAgentDir();
    const cwd = process.cwd();
    console.log(white().bold(`\n > Starting SlimIO Agent with the CLI at: ${cyan().bold(cwd)}\n`));

    const core = await (new Core(cwd, {
        silent: false,
        autoReload: 500
    })).initialize();

    // Handle exit signal!
    process.on("SIGINT", () => {
        core.exit().then(() => {
            setImmediate(process.exit);
        }).catch(function mainErrorHandler(error) {
            console.error(error);
            process.exit(1);
        });
    });
}

module.exports = start;
