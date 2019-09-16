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
 * @function directoryExist
 * @description Check if a given directory exist (and throw Error if diferent of ENOENT).
 * @memberof Utils#
 * @param {!string} dir directory location
 * @returns {Promise<void>}
 *
 * @throws {Error}
 */
async function directoryExist(dir) {
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
 * @function fileExist
 * @description Check if a given file exist (and throw Error if diferent of ENOENT).
 * @memberof Utils#
 * @param {!string} file file path
 * @returns {Promise<void>}
 *
 * @throws {Error}
 */
async function fileExist(file) {
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
    /** @type {string} */
    let name;
    try {
        const manifest = Manifest.open(join(dir, fileName));
        name = manifest.name;
    }
    catch (err) {
        const [addonName] = dir.split("\\").pop().split("-");
        await rename(dir, addonName);

        return addonName;
    }

    try {
        await rename(dir, join(dir, "..", name));
    }
    catch (err) {
        await premove(dir);
        throw err;
    }

    return name;
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
            subProcess.once("close", () => {
                spinner.succeed("Node dependencies installed");
                resolve();
            });
            subProcess.once("error", reject);
        });

        return addonDir.split("/");
    }
    catch (err) {
        spinner.failed("Something wrong append !");
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
 * @function checkBeInAgentOrAddonDir
 * @description check if we are at the root of the agent or at the root of addons dir
 * @memberof Utils#
 * @returns {void}
 *
 * @throws {Error}
 */
function checkBeInAgentOrAddonDir() {
    try {
        checkBeInAgentDir();
    }
    catch (err) {
        try {
            const { name, type } = Manifest.open(join(process.cwd(), "..", "slimio.toml"));
            if (name !== "agent" && type !== "Service") {
                throw new Error("You must be in an Agent or addons directory");
            }
            // always start from agent dir
            process.chdir("..");
        }
        catch (err) {
            throw new Error("You must be in an Agent or addons directory");
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
    directoryExist,
    fileExist,
    npmInstall,
    renameDirFromManifest,
    installAddon,
    checkBeInAgentDir,
    checkBeInAgentOrAddonDir,
    writeToAgent
});
