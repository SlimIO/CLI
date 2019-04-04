// Require Node.js Dependencies
const { spawnSync } = require("child_process");

// Require Third-party Dependencies
const download = require("@slimio/github");

// CONSTANTS
const EXEC_SUFFIX = process.platform === "win32";

function githubDownload(path) {
    return download(path, {
        auth: process.env.AUTH,
        extract: true
    });
}

function npmInstall(cwd) {
    return spawnSync(`npm${EXEC_SUFFIX ? ".cmd" : ""}`, ["install"], { cwd, stdio: "inherit" });
}

module.exports = {
    githubDownload,
    npmInstall
};
