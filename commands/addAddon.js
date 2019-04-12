// Require Node.js Dependencies
const { rename } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const { yellow, grey } = require("kleur");

// Require Internal Dependencies
const { installAddon } = require("../src/utils");

async function addAddon(add) {
    // verify instance of Agent of index.js in current dir
    process.chdir("addons");
    let myurl;
    try {
        myurl = new URL(add);
    }
    catch (error) {
        await installAddon(add);

        return;
    }

    const { hostname, pathname } = myurl;

    const spliteHostname = hostname.split(".");
    const ext = spliteHostname.pop();
    const host = spliteHostname.pop();

    if (`${host}.${ext}` !== "github.com") {
        throw new Error("URL hostname must be github.com");
    }
    const [, orga, addon] = pathname.split("/");
    if (orga !== "SlimIO") {
        throw new Error("At this time, organisation must be SlimIO");
    }

    await installAddon(addon);
}

module.exports = addAddon;
