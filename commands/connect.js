"use strict";

// Require Node.js Dependencies
const { promisify } = require("util");

// Require Third-party Dependencies
const TcpSdk = require("@slimio/tcp-sdk");
const qoa = require("qoa");
const { grey, yellow, white, red, cyan } = require("kleur");

// Require Internal Dependencies
const create = require("./create");
const REPL = require("../src/REPL");
const { getToken } = require("../src/i18n");

// CONSTANTS
const TCP_CONNECT_TIMEOUT_MS = 1000;
const DEFAULT_OPTIONS = {
    port: 1337,
    host: "localhost"
};
const CMD = new REPL();

// Vars
const sleep = promisify(setTimeout);

/**
 * @async
 * @function tcpSendMessage
 * @param {TcpClient} client TcpClient
 * @param {!string} callback callback
 * @returns {Promise<any>}
 */
async function tcpSendMessage(client, callback) {
    try {
        await client.connect(TCP_CONNECT_TIMEOUT_MS);
        const res = await client.sendOne(callback);

        return res;
    }
    finally {
        client.close();
    }
}

CMD.addCommand("reload", "reload a given addon", async({ client, args }) => {
    await client.connect(TCP_CONNECT_TIMEOUT_MS);
    const activeAddons = new Set(await client.getActiveAddons());

    try {
        for (const addonName of args) {
            if (!activeAddons.has(addonName)) {
                console.log(red().bold(await getToken("connect_addon_not_found", yellow().bold(addonName))));
                continue;
            }

            let started = false;
            try {
                const info = await client.sendOne(`${addonName}.status`);
                started = info.started;
            }
            catch (err) {
                // TODO: search for this addons with gate ?
                // TODO: catch NotFound and re-throw others ?
                // Ignore
            }

            if (started) {
                await client.sendOne(`${addonName}.stop`);
                await sleep(10);
            }
            await client.sendOne("gate.start_addon", addonName);
            console.log(white().bold(await getToken("connect_addon_restarted", cyan().bold(addonName))));
        }
    }
    finally {
        client.close();
    }
});

CMD.addCommand("addons", "Call an addon's callback", async({ client }) => {
    await client.connect(TCP_CONNECT_TIMEOUT_MS);
    let menu;
    try {
        menu = await client.getActiveAddons();
    }
    finally {
        client.close();
    }

    const { addon } = await qoa.interactive({
        query: await getToken("connect_choose_active_addon"),
        handle: "addon",
        menu
    });
    console.log("");

    const addonInfo = await tcpSendMessage(client, `${addon}.status`);
    const { callback } = await qoa.interactive({
        query: await getToken("connect_choose_callback"),
        handle: "callback",
        menu: addonInfo.callbacks
    });

    console.log("");
    try {
        const callbackResult = await tcpSendMessage(client, `${addon}.${callback}`);
        CMD.stdout(callbackResult);
    }
    catch (err) {
        console.log(red().bold(await getToken("connect_error", addon, callback, err)));
    }
    console.log("");
});

CMD.addCommand("callback", "trigger a callback yourself on the remote agent", async({ args, client }) => {
    const [target, ...rest] = args;
    if (typeof target === "undefined") {
        const targetUndefinedToken = await getToken("connect_callback_target_undefined");
        console.log(red().bold(` > ${targetUndefinedToken}`));

        return void 0;
    }
    const options = rest.length === 0 ? [] : JSON.parse(rest.join(""));

    try {
        await client.connect(TCP_CONNECT_TIMEOUT_MS);
        const result = await client.sendOne(target, options);
        CMD.stdout(result);
        console.log("");
    }
    catch (err) {
        console.error(err);
    }
    finally {
        client.close();
    }

    return void 0;
});

CMD.addCommand("create", "Create a default addon or manifest", async() => {
    await create();
});

/**
 * @async
 * @function connectAgent
 * @param {object} [options]
 * @param {string} [options.host]
 * @param {string | number} [options.port]
 * @returns {Promise<void>}
 */
async function connectAgent(options = Object.create(null)) {
    const { host, port } = Object.assign({}, DEFAULT_OPTIONS, options);

    const client = new TcpSdk({ host, port });
    client.catch((err) => console.error(err));
    await client.once("connect", TCP_CONNECT_TIMEOUT_MS);

    /** @type {string[]} */
    const autocomplete = [];
    try {
        const addons = await client.getActiveAddons();
        const infos = await Promise.all(addons.map((name) => client.sendOne(`${name}.status`)));
        for (const addon of infos) {
            autocomplete.unshift(`callback ${addon.name}.`);
            autocomplete.push(...addon.callbacks.map((cbName) => `callback ${addon.name}.${cbName}`));
        }
    }
    finally {
        client.close();
    }

    if (host === "localhost" || host === "127.0.0.1") {
        process.chdir(client.agent.location);
    }

    const connectedToken = await getToken("connect_connected", yellow().bold(host));
    console.log(white().bold(`\n > ${connectedToken}\n`));
    await CMD.init(grey(`${host}:${port} > `), { client, autocomplete });
    client.close();
}

module.exports = connectAgent;
