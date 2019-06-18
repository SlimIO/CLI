// Require Node.js Dependencies
const { spawn } = require("child_process");
const { rename, stat } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const download = require("@slimio/github");
const Manifest = require("@slimio/manifest");
const { yellow, cyan, red } = require("kleur");
const Spinner = require("@slimio/async-cli-spinner");
const premove = require("premove");
const levenshtein = require("fast-levenshtein");

// CONSTANTS
const EXEC_SUFFIX = process.platform === "win32";
const BUILT_IN_ADDONS = Object.freeze(["Events", "Socket", "Gate", "Alerting"]);

/**
 * @namespace Utils
 */

/**
 * @async
 * @func directoryExist
 * @desc Check if a given directory exist (and throw Error if diferent of ENOENT).
 * @memberof Utils#
 * @param {!String} dir directory location
 * @returns {Promise<void>}
 *
 * @throws {Error}
 */
async function directoryExist(dir) {
    try {
        const stats = await stat(dir);
        if (stats.isDirectory()) {
            throw new Error(`Directory ${init} already exist`);
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
 * @func fileExist
 * @desc Check if a given file exist (and throw Error if diferent of ENOENT).
 * @memberof Utils#
 * @param {!String} file file path
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
 * @func npmInstall
 * @memberof Utils#
 * @param {!String} cwd working dir where we need to run the npm install cmd
 * @param {Boolean} [lock=false] install with package.lock (npm ci)
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
 * @func renameDirFromManifest
 * @desc Rename cloned addon repository by retrieving the real name in the SlimIO manifest.
 * @memberof Utils#
 * @param {!String} dir location of the directory to rename
 * @param {!String} fileName manifest file name
 * @returns {Promise<String>}
 */
async function renameDirFromManifest(dir = process.cwd(), fileName = "slimio.toml") {
    /** @type {String} */
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
 * @func installAddon
 * @memberof Utils#
 * @param {!String} addonName addon name
 * @param {String=} dlDir download location
 * @returns {Promise<void>}
 */
async function installAddon(addonName, dlDir = process.cwd()) {
    const spinner = new Spinner({
        prefixText: cyan().bold(addonName),
        spinner: "dots"
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
}

/**
 * @func checkBeInAgentDir
 * @desc check if we are at the root of the agent
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
 * @func checkBeInAgentOrAddonDir
 * @desc check if we are at the root of the agent or at the root of addons dir
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

function commandReplExist(commands, command) {
    if (!commands.has(command)) {
        const isMatching = [];
        for (const item of commands.keys()) {
            const count = levenshtein.get(item, command);
            if (count <= 2) {
                isMatching.push(item);
            }
        }

        console.log(red().bold(`\nUnknown command '${yellow().bold(command)}'`));
        if (isMatching.length > 0) {
            const words = isMatching.map((row) => cyan().bold(row)).join(",");
            console.log(white().bold(`Did you mean: ${words} ?\n`));
        }

        return false;
    }

    return true;
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
    commandReplExist
});
