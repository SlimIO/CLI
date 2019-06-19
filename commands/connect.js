// Require Third-party Dependencies
const TcpSdk = require("@slimio/tcp-sdk");
const qoa = require("qoa");
const { grey, yellow, white, red } = require("kleur");

// Require Internal Dependencies
const create = require("./create");
const REPL = require("../src/REPL");

// CONSTANTS
const TCP_CONNECT_TIMEOUT_MS = 1000;
const DEFAULT_OPTIONS = {
    port: 1337,
    host: "localhost"
};
const CMD = new REPL();

/**
 * @async
 * @func tcpSendMessage
 * @param {TcpClient} client TcpClient
 * @param {!String} callback callback
 * @returns {Promise<any>}
 */
async function tcpSendMessage(client, callback) {
    await client.connect(TCP_CONNECT_TIMEOUT_MS);

    const result = await client.sendOne(callback);
    client.close();

    return result;
}

CMD.addCommand("addons", "Call an addon's callback", async({ client }) => {
    await client.connect(TCP_CONNECT_TIMEOUT_MS);
    const addons = await client.getActiveAddons();
    client.close();

    const { addon } = await qoa.prompt([{
        type: "interactive",
        query: "Choose an active addon",
        handle: "addon",
        menu: addons
    }]);
    console.log("");

    const addonInfo = await tcpSendMessage(client, `${addon}.get_info`);
    const { callback } = await qoa.prompt([{
        type: "interactive",
        query: "Choose a callback",
        handle: "callback",
        menu: addonInfo.callbacks
    }]);

    console.log("");
    const callbackResult = await tcpSendMessage(client, `${addon}.${callback}`);
    CMD.stdout(callbackResult);
    console.log("");
});

CMD.addCommand("callback", "trigger a callback yourself on the remote agent", async({ args, client }) => {
    const [target, ...rest] = args;
    if (typeof target === "undefined") {
        console.log(red().bold(" > Callback target can't be undefined"));

        return void 0;
    }
    const options = rest.length === 0 ? [] : JSON.parse(rest.join(""));

    await client.connect(TCP_CONNECT_TIMEOUT_MS);
    const result = await client.sendOne(target, options);
    CMD.stdout(result);
    console.log("");
    client.close();

    return void 0;
});

CMD.addCommand("create", "Create a default addon or manifest", async() => {
    await create();
});

async function connectAgent(options = Object.create(null)) {
    const { host, port } = Object.assign({}, DEFAULT_OPTIONS, options);

    const client = new TcpSdk({ host, port });
    client.catch((err) => console.error(err));
    await client.once("connect", TCP_CONNECT_TIMEOUT_MS);
    client.close();

    if (host === "localhost" || host === "127.0.0.1") {
        process.chdir(client.agent.location);
    }

    console.log(white().bold(`\n > Connected on '${yellow().bold(host)}' agent !\n`));
    await CMD.init(grey(`${host}:${port} >`), { client });
    client.close();
}

module.exports = connectAgent;
