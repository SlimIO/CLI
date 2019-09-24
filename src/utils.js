"use strict";

// Require Node.js Dependencies
const { stat } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const Manifest = require("@slimio/manifest");
const Lock = require("@slimio/lock");
const { cyan, white } = require("kleur");
const Spinner = require("@slimio/async-cli-spinner");
const { installAddon } = require("@slimio/installer");

// CONSTANTS
const ADDON_LOCK = new Lock({ max: 5 });

// Vars
Spinner.DEFAULT_SPINNER = process.platform === "win32" ? "line" : "dots";

/**
 * @namespace Utils
 */

/**
 * @async
 * @function directoryMustNotExist
 * @description Throw an Error if a given directory exist.
 * @memberof Utils#
 * @param {!string} dir directory location
 * @returns {Promise<void>}
 *
 * @throws {Error}
 */
async function directoryMustNotExist(dir) {
    try {
        const stats = await stat(dir);
        if (stats.isDirectory()) {
            throw new Error(`Directory ${dir} already exist`);
        }
    }
    catch (err) {
        if (err.code !== "ENOENT") {
            throw err;
        }
    }
}

/**
 * @async
 * @function fileMustNotExist
 * @description Assert that a given file not exist (else we throw an error).
 * @memberof Utils#
 * @param {!string} file file path
 * @returns {Promise<void>}
 *
 * @throws {Error}
 */
async function fileMustNotExist(file) {
    try {
        const stats = await stat(file);
        if (stats.isFile()) {
            throw new Error(`File ${file} already exist`);
        }
    }
    catch (err) {
        if (err.code !== "ENOENT") {
            throw err;
        }
    }
}

/**
 * @async
 * @function install
 * @memberof Utils#
 * @param {!string} addonName addon name
 * @param {object} options options
 * @param {string} [options.dest] download location
 * @param {string} [options.verbose=true] Display spinner
 * @returns {Promise<void>}
 */
async function install(addonName, options = Object.create(null)) {
    const { dest = process.cwd(), verbose = true } = options;

    const free = await ADDON_LOCK.acquireOne();
    const spinner = new Spinner({
        prefixText: cyan().bold(addonName), verbose
    }).start(white().bold("Clone and Install Addon"));

    try {
        const token = typeof process.env.GIT_TOKEN === "string" ? { token: process.env.GIT_TOKEN } : {};
        await installAddon(addonName, dest, {
            forceMkdir: false,
            ...token
        });
        spinner.succeed("Addon successfully installed!");

        return addonName;
    }
    catch (err) {
        spinner.failed(`Error occured: ${err.message}`);
        throw err;
    }
    finally {
        free();
    }
}

/**
 * @function checkBeInAgentDir
 * @description check if we are at the root of the agent
 * @memberof Utils#
 * @returns {void}
 *
 * @throws {Error}
 */
function checkBeInAgentDir() {
    try {
        const { name, type } = Manifest.open();
        if (name !== "agent" && type !== "Service") {
            throw new Error();
        }
    }
    catch (err) {
        throw new Error("You must be in an Agent directory");
    }
}

/**
 * @function checkBeInAgentOrSubDir
 * @description check if we are at the root of the agent or at the root of addons dir
 * @memberof Utils#
 * @param {number} [depth=1]
 * @returns {void}
 *
 * @throws {Error}
 */
function checkBeInAgentOrSubDir(depth = 1) {
    try {
        checkBeInAgentDir();
    }
    catch (err) {
        try {
            const pathToUnmount = "../".repeat(depth);
            const { name, type } = Manifest.open(join(process.cwd(), pathToUnmount, "slimio.toml"));
            if (name !== "agent" && type !== "Service") {
                throw new Error("You must be in an Agent or addons directory");
            }
            // always start from agent dir
            process.chdir(pathToUnmount);
        }
        catch (err) {
            throw new Error("You must be in an Agent or in one of the sub-directory");
        }
    }
}

module.exports = Object.freeze({
    directoryMustNotExist,
    fileMustNotExist,
    install,
    checkBeInAgentDir,
    checkBeInAgentOrSubDir
});
