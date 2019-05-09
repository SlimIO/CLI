// Require Node.js Dependencies
const { spawn } = require("child_process");
const { rename } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const download = require("@slimio/github");
const Manifest = require("@slimio/manifest");
const { yellow, grey } = require("kleur");
const Spinner = require("@slimio/async-cli-spinner");

// CONSTANTS
const EXEC_SUFFIX = process.platform === "win32";

function githubDownload(path, dest = process.cwd()) {
    return download(path, {
        dest,
        auth: process.env.AUTH,
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
    const spinner = new Spinner({ prefixText: yellow(addonName), spinner: "dots" });
    spinner.start("Installation started");
    try {
        spinner.text = "Cloning from GitHub";
        const dirName = await githubDownload(`SlimIO.${addonName}`, dlDir);

        spinner.text = "Renaming folder from manifest";
        const addonDir = await renameDirFromManifest(dirName);

        spinner.text = "Installing dependencies";
        await new Promise((resolve, reject) => {
            const subProcess = npmInstall(join(dlDir, addonDir));
            subProcess.on("close", (code) => {
                spinner.succeed("Node dependencies installed");
                resolve();
            });
            subProcess.on("error", reject);
        });
    }
    catch (err) {
        spinner.failed("Something wrong append !");
        throw Error(err);
    }
}

async function installAgentDep(agentDir) {
    return new Promise((resolve, reject) => {
        const spinner = new Spinner({ prefixText: yellow("Agent"), spinner: "dots" });
        spinner.start("Installing dependencies");
        const subProcess = npmCI(agentDir);
        subProcess.on("close", (code) => {
            spinner.succeed("Node dependencies installed");
            resolve();
        });
        subProcess.on("error", (err) => {
            spinner.failed("Something wrong append !");
            reject(err);
        });
    });
}

module.exports = {
    githubDownload,
    npmInstall,
    npmCI,
    renameDirFromManifest,
    installAddon,
    installAgentDep
};
