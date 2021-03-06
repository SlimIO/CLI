"use strict";

// Require Node.js Dependencies
const { join } = require("path");

// Require Third-party Dependencies
const bundler = require("@slimio/bundler");
const { yellow, white } = require("kleur");

// Require Internal Dependencies
const { checkBeInAgentDir } = require("../src/utils");
const { getToken } = require("../src/i18n");

/**
 * @async
 * @function build
 * @returns {Promise<void>}
 */
async function build() {
    checkBeInAgentDir();

    console.log("");
    const location = await bundler.generateCoreExecutable(process.cwd(), {
        debug: true,
        cwd: join(process.cwd(), "build")
    });

    const buildToken = getToken("build_generate_core", yellow().bold(location));
    console.log(white().bold(`\n${buildToken}`));
}

module.exports = build;
