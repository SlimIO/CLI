// Require Node.js Dependencies
const { readFile, writeFile, readdir, access } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const qoa = require("qoa");
const { grey, yellow, white, red, cyan } = require("kleur");
const jsonDiff = require("json-diff");
const cloneDeep = require("lodash.clonedeep");
const prettyJSON = require("@slimio/pretty-json");

// Require Internal Dependencies
const {
    BUILT_IN_ADDONS,
    checkBeInAgentOrAddonDir
} = require("../src/utils");
const REPL = require("../src/REPL");

async function getFileAddon() {
    try {
        const file = await readFile("agent.json", { encoding: "utf8" });

        return JSON.parse(file).addons;
    }
    catch (err) {
        const addons = {};
        for (const addon of BUILT_IN_ADDONS) {
            Reflect.set(addons, addon.toLowerCase(), { active: true });
        }
        await writeFile("agent.json", JSON.stringify({ addons }, null, 4));

        return addons;
    }
}

async function getLocalAddons() {
    const addonsDir = join(process.cwd(), "addons");
    const ret = new Set();

    const dirents = await readdir(addonsDir, { encoding: "utf8", withFileTypes: true });
    for (const dirent of dirents) {
        try {
            if (!dirent.isDirectory()) {
                continue;
            }
            await access(join(addonsDir, dirent.name, "index.js"));
            ret.add(dirent.name);
        }
        catch (err) {
            continue;
        }
    }

    return ret;
}

async function splitAddons(ctx) {
    if (ctx.args.length > 0) {
        const addons = ctx.args.map((arg) => arg.split(",")).flat();
        console.log("");

        return addons.filter((addon) => {
            const exist = ctx.localAddons.has(addon) || ctx.addons.has(addon);
            if (!exist) {
                console.log(red().bold(` > Unable to found '${yellow().bold(addon)}' addon`));
            }

            return exist;
        });
    }

    const { addon } = await qoa.prompt([{
        type: "interactive",
        query: "Choose an addon",
        handle: "addon",
        menu: [...ctx.localAddons]
    }]);
    console.log("");

    return [addon];
}

async function activeSwitch(ctx, switcher = false) {
    const addons = await splitAddons(ctx);
    const agentBeforeUpdate = cloneDeep(ctx.agentConfig);
    for (const addon of addons) {
        Reflect.set(ctx.agentConfig[addon], "active", switcher);
    }

    console.log(grey().bold(jsonDiff.diffString(agentBeforeUpdate, ctx.agentConfig)));
    await writeFile("agent.json", JSON.stringify({ addons: ctx.agentConfig }, null, 4));
    console.log("");
}

const CMD = new REPL();

CMD.addCommand("enable", "Enable a given addon", async(ctx) => {
    await activeSwitch(ctx, true);
});

CMD.addCommand("disable", "Disable a given addon", async(ctx) => {
    await activeSwitch(ctx, false);
});

CMD.addCommand("sync", "sync agent.json with addons folder", async(ctx) => {
    const agentBeforeUpdate = cloneDeep(ctx.agentConfig);

    if (ctx.args.length > 0) {
        const addons = await splitAddons(ctx);

        for (const addon of addons) {
            if (!ctx.localAddons.has(addon)) {
                Reflect.deleteProperty(ctx.agentConfig, addon);
                ctx.addons.delete(addon);
                console.log(white().bold(`> Removing addon '${cyan().bold(addon)}'`));
            }
            else if (!ctx.addons.has(addon)) {
                Reflect.set(ctx.agentConfig, addon, { active: false });
                ctx.addons.add(addon);
                console.log(white().bold(`> Adding missing addon '${cyan().bold(addon)}' (as active: ${red().bold("false")})`));
            }
        }
    }
    else {
        console.log("");
        for (const addon of ctx.addons) {
            if (!ctx.localAddons.has(addon)) {
                Reflect.deleteProperty(ctx.agentConfig, addon);
                ctx.addons.delete(addon);
                console.log(white().bold(`> Removing addon '${cyan().bold(addon)}'`));
            }
        }
        for (const addon of ctx.localAddons) {
            if (!ctx.addons.has(addon)) {
                Reflect.set(ctx.agentConfig, addon, { active: false });
                ctx.addons.add(addon);
                console.log(white().bold(`> Adding missing addon '${cyan().bold(addon)}'`));
            }
        }
    }

    console.log("");
    console.log(grey().bold(jsonDiff.diffString(agentBeforeUpdate, ctx.agentConfig)));
    await writeFile("agent.json", JSON.stringify({ addons: ctx.agentConfig }, null, 4));
});

CMD.addCommand("addons", "Show the list of addons registered in agent.json", (ctx) => {
    CMD.stdout([...ctx.localAddons], true);
});

async function configure(cmd, addons = "") {
    checkBeInAgentOrAddonDir();
    const [agentConfig, localAddons] = await Promise.all([
        getFileAddon(),
        getLocalAddons()
    ]);
    console.log("");

    // Define context
    const ctx = {
        agentConfig,
        addons: new Set([...Object.keys(agentConfig)]),
        localAddons
    };

    if (typeof cmd === "string") {
        ctx.args = [addons.trim()];
        await CMD.callHandler(cmd, ctx);
    }
    else {
        await CMD.init(grey("agent.json >"), ctx);
    }
}

module.exports = configure;
