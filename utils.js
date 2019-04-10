// Require Node.js Dependencies
const { spawnSync } = require("child_process");
const { rename } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const download = require("@slimio/github");
const Manifest = require("@slimio/manifest");

// CONSTANTS
const EXEC_SUFFIX = process.platform === "win32";

function githubDownload(path) {
    return download(path, {
        auth: process.env.AUTH,
        extract: true
    });
}

function npmInstall(cwd) {
    return spawnSync(`npm${EXEC_SUFFIX ? ".cmd" : ""}`, ["install", "--production"], { cwd, stdio: "inherit" });
}

function npmCI(cwd) {
    return spawnSync(`npm${EXEC_SUFFIX ? ".cmd" : ""}`, ["ci"], { cwd, stdio: "inherit" });
}

async function renameDirFromManifest(dir = process.cwd(), fileName = "slimio.toml") {
    process.chdir(dir);
    const { name } = Manifest.open(join(dir, fileName));
    process.chdir("..");

    const dirName = join(process.cwd(), name);
    await rename(dir, dirName);

    return dirName;
}

module.exports = {
    githubDownload,
    npmInstall,
    npmCI,
    renameDirFromManifest
};
