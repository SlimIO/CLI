// Require Node.js Dependencies
const { rename } = require("fs").promises;

// Require Internal Dependencies
const {
    githubDownload,
    npmInstall
} = require("../utils");

async function addAddon(add) {
    process.chdir("addons");
    let myurl;
    try {
        myurl = new URL(add);
    }
    catch (error) {
        const dirName = await githubDownload(`SlimIO.${add}`);
        await rename(dirName, add);
        console.log(`Addon ${add} has been cloned from GitHub`);

        process.chdir(add);
        console.log("> npm install");

        npmInstall(process.cwd());

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

    const dirName = await githubDownload(`SlimIO.${addon}`);
    await rename(dirName, addon);
    console.log(`Addon ${addon} has been cloned from GitHub`);

    process.chdir(addon);
    console.log("> npm install");

    npmInstall(process.cwd());
}

module.exports = addAddon;
