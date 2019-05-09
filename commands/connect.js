// Require Third-party Dependencies
const TcpSdk = require("@slimio/tcp-sdk");
const qoa = require("qoa");
const { grey, yellow } = require("kleur");

// Require Internal Dependencies
const create = require("./create");

// CONSTANTS
const TCP_CONNECT_TIMEOUT_MS = 1000;
const DEFAULT_OPTIONS = {
    port: 1337,
    host: "localhost"
};

const commands = new Map([
    ["addons", "Call an addon's callback"],
    ["create", "Create a default addon or manifest"],
    ["help", "Display all commands"],
    ["quit", "Quit prompt"]
]);

async function tcpSendMessage(client, addonCallback) {
    await client.connect(TCP_CONNECT_TIMEOUT_MS);

    const result = await new Promise((resolve, reject) => {
        client.sendMessage(addonCallback).subscribe(resolve, reject);
    });
    client.close();

    return result;
}

async function connectAgent(options = Object.create(null)) {
    const { port, host } = Object.assign({}, DEFAULT_OPTIONS, options);

    const client = new TcpSdk({ host, port });
    await client.once("connect", TCP_CONNECT_TIMEOUT_MS);
    const { version, location } = client.agent;
    client.close();

    if (host === "localhost" || host === "127.0.0.1") {
        process.chdir(location);
    }

    console.log(yellow("Connected on agent !\n"));

    const prompt = grey(`${host}:${port} >`);
    let cmd;
    while (cmd !== "quit") {
        const { command } = await qoa.prompt([{
            type: "input",
            query: prompt,
            handle: "command"
        }]);
        cmd = command;

        if (!commands.has(cmd)) {
            continue;
        }

        if (cmd === "create") {
            await create();
        }

        if (cmd === "addons") {
            await client.connect(TCP_CONNECT_TIMEOUT_MS);
            const addons = await client.getActiveAddons();
            client.close();

            const { addon } = await qoa.prompt([{
                type: "interactive",
                query: "Choose an active addon",
                handle: "addon",
                menu: addons
            }]);
            console.log();

            const addonInfo = await tcpSendMessage(client, `${addon}.get_info`);
            const { callback } = await qoa.prompt([{
                type: "interactive",
                query: "Choose a callback",
                handle: "callback",
                menu: addonInfo.callbacks
            }]);

            const callbackResult = await tcpSendMessage(client, `${addon}.${callback}`);
            console.log(callbackResult);
            console.log();
        }

        if (cmd === "help") {
            console.log();
            console.log(grey().bold("commands :"));
            for (const [command, desc] of commands) {
                console.log(`${command}: ${desc}`);
            }
            console.log();
        }
    }

    client.close();
    console.log(`Connect to ${prompt} closed`);
}

module.exports = connectAgent;
