// Require Internal Dependencies
const { installAddon, checkBeInAgentDir } = require("../src/utils");

async function addAddon(add) {
    checkBeInAgentDir();
    process.chdir("addons");

    /** @type {URL} */
    let myurl;
    try {
        myurl = new URL(add);
    }
    catch (error) {
        await installAddon(add);

        return;
    }

    const { hostname, pathname } = myurl;
    const [ext, host] = hostname.split(".").slice(-2);

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
