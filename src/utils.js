// Require Node.js Dependencies
const { spawn } = require("child_process");
const { rename, stat, rmdir } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const download = require("@slimio/github");
const Manifest = require("@slimio/manifest");
const { yellow, cyan } = require("kleur");
const Spinner = require("@slimio/async-cli-spinner");

// CONSTANTS
const EXEC_SUFFIX = process.platform === "win32";

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

function githubDownload(path, dest = process.cwd()) {
    return download(path, {
        dest,
        auth: process.env.GIT_TOKEN,
        extract: true
    });
}

function npmInstall(cwd = process.cwd()) {
    return spawn(`npm${EXEC_SUFFIX ? ".cmd" : ""}`, ["install", "--production"], { cwd, stdio: "pipe" });
}

function npmCI(cwd = process.cwd()) {
    return spawn(`npm${EXEC_SUFFIX ? ".cmd" : ""}`, ["ci"], { cwd, stdio: "pipe" });
}

async function renameDirFromManifest(dir = process.cwd(), fileName = "slimio.toml") {
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

    await rename(dir, join(dir, "..", name));

    return name;
}

async function installAddon(addonName, dlDir = process.cwd()) {
    // console.log(yellow().green(dlDir));
    const spinner = new Spinner({ prefixText: cyan().bold(addonName), spinner: "dots" });
    spinner.start("Installation started");
    try {
        spinner.text = "Cloning from GitHub";
        const dirName = await githubDownload(`SlimIO.${addonName}`, dlDir);

        spinner.text = "Renaming folder from manifest";
        let addonDir;
        try {
            addonDir = await renameDirFromManifest(dirName);
        }
        catch (err) {
            console.log("rmdir:", dirName);
            await rmdir(dirName);
            throw err;
        }

        spinner.text = "Installing dependencies";
        await new Promise((resolve, reject) => {
            const subProcess = npmInstall(join(dlDir, addonDir));
            subProcess.once("close", (code) => {
                spinner.succeed(`Node dependencies installed, code => ${code}`);
                resolve();
            });
            subProcess.once("error", reject);
        });

        return addonName;
    }
    catch (err) {
        // spinner.failed("Something wrong append !");
        spinner.failed();
        throw err;
    }
}

async function installAgentDep(agentDir) {
    return new Promise((resolve, reject) => {
        const spinner = new Spinner({ prefixText: cyan().bold("Agent"), spinner: "dots" });
        spinner.start("Installing dependencies");
        const subProcess = npmCI(agentDir);
        subProcess.once("close", (code) => {
            spinner.succeed("Node dependencies installed");
            resolve();
        });
        subProcess.once("error", (err) => {
            spinner.failed("Something wrong append !");
            reject(err);
        });
    });
}

function checkBeInAgentDir() {
    try {
        const { name, type } = Manifest.open();
        if (name !== "agent" && type !== "Service") {
            throw Error();
        }
    }
    catch (err) {
        throw new Error("You must be in an Agent directory");
    }
}

module.exports = {
    directoryExist,
    fileExist,
    githubDownload,
    npmInstall,
    npmCI,
    renameDirFromManifest,
    installAddon,
    installAgentDep,
    checkBeInAgentDir
};
