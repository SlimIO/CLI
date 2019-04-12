// Require Node.js Dependencies
const { spawnSync } = require("child_process");
const { rename } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const download = require("@slimio/github");
const Manifest = require("@slimio/manifest");
const { yellow, grey } = require("kleur");

// CONSTANTS
const EXEC_SUFFIX = process.platform === "win32";

function githubDownload(path) {
    return download(path, {
        auth: process.env.AUTH,
        extract: true
    });
}

function npmInstall(cwd = process.cwd()) {
    return spawnSync(`npm${EXEC_SUFFIX ? ".cmd" : ""}`, ["install", "--production"], { cwd, stdio: "inherit" });
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

    await rename(dir, join(process.cwd(), name));

    return name;
}

async function installAddon(addonName) {
    const dirName = await githubDownload(`SlimIO.${addonName}`);
    const addonRealName = dirName.split("\\").pop();
    console.log(`Addon ${yellow(addonRealName)} has been cloned from GitHub`);

    const addonDir = await renameDirFromManifest(dirName);
    console.log(`Directory ${yellow(addonRealName)} has been renamed as ${yellow(addonDir)}`);

    console.log(`${yellow(">")} ${grey("npm install")}`);

    npmInstall(join(process.cwd(), addonDir));
}

module.exports = {
    githubDownload,
    npmInstall,
    npmCI,
    renameDirFromManifest,
    installAddon
};
