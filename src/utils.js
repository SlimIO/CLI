"use strict";

// Require Node.js Dependencies
const { spawn } = require("child_process");
const { existsSync } = require("fs");
const { rename, stat, writeFile, readFile } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const download = require("@slimio/github");
const Manifest = require("@slimio/manifest");
const Lock = require("@slimio/lock");
const { cyan, white, grey, red, yellow } = require("kleur");
const Spinner = require("@slimio/async-cli-spinner");
const premove = require("premove");
const jsonDiff = require("json-diff");

// CONSTANTS
const EXEC_SUFFIX = process.platform === "win32";
const BUILT_IN_ADDONS = Object.freeze(["Events", "Socket", "Gate", "Alerting"]);
const ADDON_LOCK = new Lock({ max: 3 });

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
 * @function npmInstall
 * @memberof Utils#
 * @param {!string} cwd working dir where we need to run the npm install cmd
 * @param {boolean} [lock=false] install with package.lock (npm ci)
 * @returns {NodeJS.ReadableStream}
 */
function npmInstall(cwd = process.cwd(), lock = false) {
    const ci = lock ? ["ci"] : ["install", "--production"];

    return spawn(`npm${EXEC_SUFFIX ? ".cmd" : ""}`, ci, {
        cwd, stdio: "pipe"
    });
}

/**
 * @async
 * @function renameDirFromManifest
 * @description Rename cloned addon repository by retrieving the real name in the SlimIO manifest.
 * @memberof Utils#
 * @param {!string} dir location of the directory to rename
 * @param {!string} fileName manifest file name
 * @returns {Promise<string>}
 */
async function renameDirFromManifest(dir = process.cwd(), fileName = "slimio.toml") {
    try {
        const { name } = Manifest.open(join(dir, fileName));
        await rename(dir, join(dir, "..", name));

        return name;
    }
    catch (err) {
        const [addonName] = dir.split("\\").pop().split("-");
        await rename(dir, addonName);

        return addonName;
    }
}

/**
 * @async
 * @function installAddon
 * @memberof Utils#
 * @param {!string} addonName addon name
 * @param {object} options options
 * @param {string} [options.dlDir] download location
 * @param {string} [options.verbose=true] Display spinner
 * @returns {Promise<void>}
 */
async function installAddon(addonName, options = Object.create(null)) {
    const { dlDir = process.cwd(), verbose = true } = options;

    const free = await ADDON_LOCK.acquireOne();
    const spinner = new Spinner({
        prefixText: cyan().bold(addonName),
        spinner: "dots",
        verbose
    }).start("Installation started");

    try {
        spinner.text = "Cloning from GitHub";
        const dirName = await download(`SlimIO.${addonName}`, {
            dest: dlDir,
            auth: process.env.GIT_TOKEN,
            extract: true
        });

        spinner.text = "Renaming folder from manifest";
        const addonDir = await renameDirFromManifest(dirName);

        spinner.text = "Installing dependencies";
        await new Promise((resolve, reject) => {
            const subProcess = npmInstall(join(dlDir, addonDir));
            subProcess.once("close", resolve);
            subProcess.once("error", reject);
        });
        spinner.succeed("Node dependencies installed");

        return addonDir.split("/");
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

/**
 * @async
 * @function writeToAgent
 * @param {!string} addonName
 * @param {boolean} [active=false]
 * @returns {Promise<void>}
 */
async function writeToAgent(addonName, active = false) {
    const agentConfig = join(process.cwd(), "agent.json");
    console.log(white().bold(`\nWriting addon in the local configuration '${yellow().bold(agentConfig)}'`));

    const configExist = existsSync(agentConfig);
    const addons = { [addonName]: { active } };

    if (configExist) {
        const buf = await readFile(agentConfig);
        let str = buf.toString().trim();
        if (str === "") {
            str = "{}";
        }
        const json = JSON.parse(str);
        if (!Reflect.has(json, "addons")) {
            json.addons = {};
        }
        Object.assign(json.addons, addons);

        console.log(grey().bold(jsonDiff.diffString(JSON.parse(str), json)));
        await writeFile(agentConfig, JSON.stringify(json, null, 4));
    }
    else {
        console.log(red().bold("(!) No local configuration detected. Creating one from scratch."));
        await writeFile(agentConfig, JSON.stringify({ addons }, null, 4));
    }
}

module.exports = Object.freeze({
    BUILT_IN_ADDONS,
    directoryMustNotExist,
    fileMustNotExist,
    npmInstall,
    renameDirFromManifest,
    installAddon,
    checkBeInAgentDir,
    checkBeInAgentOrSubDir,
    writeToAgent
});
