"use strict";

// Require Node.js Dependencies
const { readFile, access, readdir, rmdir } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const { white, cyan, yellow } = require("kleur");
const prettyStack = require("@slimio/pretty-stack");
const qoa = require("qoa");

// Require Internal Dependencies
const { checkBeInAgentOrSubDir } = require("../src/utils");

/**
 * @async
 * @function debug
 * @param {!boolean} clearFiles
 * @returns {Promise<void>}
 */
async function debug(clearFiles) {
    checkBeInAgentOrSubDir();

    let files;
    const debugDir = join(process.cwd(), "debug");
    try {
        await access(debugDir);
        files = await readdir(debugDir, { withFileTypes: true });
        if (files.filter((dirent) => dirent.isFile()).length === 0) {
            throw new Error("no dump");
        }
    }
    catch (err) {
        console.log(white().bold("\n > No dump (debug dir) detected"));

        return;
    }

    if (clearFiles) {
        console.log(yellow().bold("\n > Removing all dump files in debug directory"));
        await rmdir(debugDir, { recursive: true });

        return;
    }

    for (let id = 0; id < files.length; id++) {
        const dirent = files[id];
        if (!dirent.isFile()) {
            continue;
        }
        const fullPath = join(debugDir, dirent.name);
        console.log(`\ndump file: ${cyan().bold(fullPath)}`);
        const str = await readFile(fullPath, "utf-8");
        const dumpJson = JSON.parse(str);
        prettyStack(dumpJson.stack, false);

        if (id + 1 === files.length) {
            break;
        }
        const { goNext } = await qoa.confirm({
            query: yellow().bold("do you want to continue to the next dump ?"),
            handle: "goNext",
            accept: "y"
        });
        if (!goNext) {
            break;
        }
    }
}

module.exports = debug;
