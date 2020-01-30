"use strict";

// Require Node.js Dependencies
const { stat } = require("fs").promises;
const { join, sep } = require("path");

// Require Third-party Dependencies
const Manifest = require("@slimio/manifest");
const Lock = require("@slimio/lock");
const Spinner = require("@slimio/async-cli-spinner");
const stdin = require("@slimio/stdin");
const is = require("@slimio/is");
const qoa = require("qoa");
const { get } = require("httpie");
const { red, grey, yellow, cyan, white, green, bgMagenta } = require("kleur");
const { installAddon } = require("@slimio/installer");

// Require Internal Dependencies
const { getToken } = require("./i18n");

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
            throw new Error(`Directory '${dir}' already exist`);
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
            throw new Error(`File '${file}' already exist`);
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
    const spinner = new Spinner({
        prefixText: cyan().bold(addonName), verbose
    }).start(white().bold(getToken("utils.clone_install")));
    const free = await ADDON_LOCK.acquireOne();

    try {
        const token = typeof process.env.GIT_TOKEN === "string" ? { token: process.env.GIT_TOKEN } : {};
        const addonDir = await installAddon(addonName, dest, {
            forceMkdir: false,
            ...token
        });
        spinner.succeed(green().bold("done!"));

        return addonDir.split(sep).pop();
    }
    catch (err) {
        spinner.failed(`${getToken("keywords.error")}: ${err.message}`);
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
        throw new Error(getToken("utils.mustbe_agentdir"));
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
                throw new Error(getToken("utils.mustbe_agent_or_subdir"));
            }
            // always start from agent dir
            process.chdir(pathToUnmount);
        }
        catch (err) {
            throw new Error(getToken("utils.mustbe_agent_or_subdir"));
        }
    }
}

/**
 * @function cleanupAddonsList
 * @description cleanup a list of addons (remove double etc..).
 * @memberof Utils#
 * @param {string[]} [addons]
 * @returns {string[]}
 */
function cleanupAddonsList(addons = []) {
    return [...new Set(addons.map((name) => name.toLowerCase()))];
}

/**
 * @function clearLine
 * @description clear stdout (TTY) lines
 * @memberof Utils#
 * @param {number} [dy=1]
 * @returns {void}
 */
function clearLine(dy = 1) {
    let tDy = dy;

    while (tDy--) {
        process.stdout.clearLine(0);
        process.stdout.moveCursor(0, -1);
    }
}

/**
 * @async
 * @function interactiveAddons
 * @description construct addons list interactively!
 * @memberof Utils#
 * @param {string[]} [addons]
 * @returns {Promise<void>}
 */
async function interactiveAddons(addons) {
    console.log("");
    const { data } = await get("https://raw.githubusercontent.com/SlimIO/Governance/master/addons.json");
    /** @type {string[]} */
    const autocomplete = JSON.parse(data);

    while (1) {
        if (addons.length > 0) {
            const list = addons.map((value) => bgMagenta(white().bold(` ${value} `))).join("  ");
            console.log(grey().bold(` addons ${list}`));
            console.log(grey().bold(" - - - - - - - - - - - - - - - - - - -"));
        }

        const addonName = await stdin(white().bold(` ${getToken("add_addon_name")}`), { autocomplete });
        if (is.nullOrUndefined(addonName)) {
            if (addons.length === 0) {
                console.log(red().bold(`\n > ${getToken("interactive.leaving")}`));

                return false;
            }

            clearLine(1);
            const { leave } = await qoa.confirm({
                query: yellow().bold(` ${getToken("interactive.ask_to_leave")}`),
                handle: "leave",
                accept: "y"
            });
            if (leave) {
                break;
            }
        }
        else {
            autocomplete.splice(autocomplete.indexOf(addonName), 1);
            addons.push(addonName);
        }
        clearLine(addons.length <= 1 ? 2 : 4);
        console.log("");
    }
    console.log("");

    return true;
}

module.exports = Object.freeze({
    directoryMustNotExist,
    fileMustNotExist,
    install,
    checkBeInAgentDir,
    checkBeInAgentOrSubDir,
    cleanupAddonsList,
    clearLine,
    interactiveAddons
});
