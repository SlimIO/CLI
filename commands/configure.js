"use strict";

// Require Node.js Dependencies
const { writeFile } = require("fs").promises;

// Require Third-party Dependencies
const qoa = require("qoa");
const { grey, yellow, white, red, cyan } = require("kleur");
const jsonDiff = require("@slimio/json-diff");
const cloneDeep = require("lodash.clonedeep");

// Require Internal Dependencies
const { checkBeInAgentOrSubDir } = require("../src/utils");
const { getFileAddon, getLocalAddons } = require("../src/agent");
const REPL = require("../src/REPL");
const { getToken } = require("../src/i18n");

/**
 * @async
 * @function splitAddons
 * @param {*} ctx
 * @returns {string[]}
 */
async function splitAddons(ctx) {
    if (ctx.args.length > 0) {
        const addons = ctx.args.map((arg) => arg.split(",")).flat();
        console.log("");

        return addons.filter(async(addon) => {
            const exist = ctx.localAddons.has(addon) || ctx.addons.has(addon);
            if (!exist) {
                console.log(red().bold(await getToken("configure_unable_addon", yellow().bold(addon))));
            }

            return exist;
        });
    }

    console.log("");
    const { addon } = await qoa.interactive({
        query: yellow().bold(await getToken("configure_choose_addon")),
        handle: "addon",
        menu: [...ctx.localAddons]
    });
    console.log("");

    return [addon];
}

/**
 * @async
 * @function activeSwitch
 * @param {*} ctx
 * @param {*} switcher
 * @returns {Promise<void>}
 */
async function activeSwitch(ctx, switcher = false) {
    const addons = await splitAddons(ctx);
    const agentBeforeUpdate = cloneDeep(ctx.agentConfig);
    for (const addon of addons) {
        Reflect.set(ctx.agentConfig[addon], "active", switcher);
    }

    jsonDiff(agentBeforeUpdate, ctx.agentConfig);
    await writeFile("agent.json", JSON.stringify({ addons: ctx.agentConfig }, null, 4));
    console.log("");
}

const CMD = new REPL();

CMD.addCommand("enable", "enable a given addon", async(ctx) => {
    await activeSwitch(ctx, true);
});

CMD.addCommand("disable", "disable a given addon", async(ctx) => {
    await activeSwitch(ctx, false);
});

CMD.addCommand("sync", "synchronize agent.json with the /addons directory", async(ctx) => {
    const agentBeforeUpdate = cloneDeep(ctx.agentConfig);
    let udpateCount = 0;

    if (ctx.args.length > 0) {
        const addons = await splitAddons(ctx);

        for (const addon of addons) {
            if (!ctx.localAddons.has(addon)) {
                Reflect.deleteProperty(ctx.agentConfig, addon);
                ctx.addons.delete(addon);
                console.log(white().bold(await getToken("configure_removing_addon", cyan().bold(addon))));
                udpateCount++;
            }
            else if (!ctx.addons.has(addon)) {
                Reflect.set(ctx.agentConfig, addon, { active: false });
                ctx.addons.add(addon);
                console.log(white().bold(
                    await getToken("configure_active_missing_addon", cyan().bold(addon), red().bold("false")))
                );
                udpateCount++;
            }
        }
    }
    else {
        console.log("");
        for (const addon of ctx.addons) {
            if (!ctx.localAddons.has(addon)) {
                Reflect.deleteProperty(ctx.agentConfig, addon);
                ctx.addons.delete(addon);
                console.log(white().bold(await getToken("configure_removing_addon", cyan().bold(addon))));
                udpateCount++;
            }
        }
        for (const addon of ctx.localAddons) {
            if (!ctx.addons.has(addon)) {
                Reflect.set(ctx.agentConfig, addon, { active: false });
                ctx.addons.add(addon);
                console.log(white().bold(await getToken("configure_add_missing_addon", cyan().bold(addon))));
                udpateCount++;
            }
        }
    }

    if (udpateCount === 0) {
        // TODO: remove the line before ?
        console.log(white().bold(await getToken("configure_no_synchronization")));
    }
    else {
        console.log("");
        jsonDiff(agentBeforeUpdate, ctx.agentConfig);
        await writeFile("agent.json", JSON.stringify({ addons: ctx.agentConfig }, null, 4));
    }
});

CMD.addCommand("addons", "show the list of addons registered in agent.json", (ctx) => {
    CMD.stdout([...ctx.localAddons], ctx.hasREPL);
});

/**
 * @async
 * @function configure
 * @param {!string} cmd
 * @param {string[] | null} addons
 * @returns {Promise<void>}
 */
async function configure(cmd, addons = null) {
    try {
        checkBeInAgentOrSubDir();
    }
    catch (err) {
        console.log(grey().bold(`\n > ${red().bold(await getToken("configure_workdir_not_agent"))}`));
        console.log(grey().bold(` > ${yellow().bold(process.cwd())}`));

        return;
    }

    const [agentConfig, localAddons] = await Promise.all([
        getFileAddon(),
        getLocalAddons()
    ]);
    console.log("");

    // Define context
    const ctx = {
        agentConfig,
        addons: new Set([...Object.keys(agentConfig)]),
        localAddons,
        hasREPL: true
    };

    if (typeof cmd === "string") {
        ctx.args = addons === null ? [] : [addons.trim()];
        ctx.hasREPL = false;
        await CMD.callHandler(cmd, ctx);
    }
    else {
        await CMD.init(grey("agent.json > "), ctx);
    }
}

module.exports = configure;
