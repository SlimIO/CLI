// Require Node.js Dependencies
const { spawnSync, spawn } = require("child_process");
const { rename } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const download = require("@slimio/github");
const Manifest = require("@slimio/manifest");
const { yellow, grey } = require("kleur");
const ora = require("ora");

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
    return spawnSync(`npm${EXEC_SUFFIX ? ".cmd" : ""}`, ["ci"], { cwd, stdio: "inherit" });
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
    const spinner = ora().start(addonName);
    try {
        const dirName = await githubDownload(`SlimIO.${addonName}`, dlDir);
        // console.log(`DIR_NAME: ${yellow().green(dirName)}`);
        const addonRealName = dirName.split("\\").pop();
        spinner.text = `Addon ${yellow(addonRealName)} has been cloned from GitHub`;

        const addonDir = await renameDirFromManifest(dirName);
        spinner.text = `Directory ${yellow(addonRealName)} has been renamed as ${yellow(addonDir)}`;

        // console.log(`${yellow(">")} ${grey("npm install")}`);
        spinner.text = `${yellow(">")} ${grey("npm install")}`;
        await new Promise((resolve, reject) => {
            const subProcess = npmInstall(join(dlDir, addonDir));
            subProcess.on("close", (code) => {
                spinner.succeed(`Addon ${addonName} succeed installed`);
                resolve();
            });
            subProcess.stderr.on("data", (data) => {
                // console.log(data.toString("utf8"));
                // spinner.fail(`Addon ${addonName} fail with err : ${data}`);
            });
            subProcess.on("error", reject);
        });
    }
    catch (err) {
        spinner.fail(`Addon ${addonName} fail with err : ${err}`);
    }
}

module.exports = {
    githubDownload,
    npmInstall,
    npmCI,
    renameDirFromManifest,
    installAddon
};
