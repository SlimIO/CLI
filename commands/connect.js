// Require Third-party Dependencies
const TcpSdk = require("@slimio/tcp-sdk");
const inquirer = require("inquirer");

// Require Internal Dependencies
const create = require("./create");

// CONSTANTS
const TCP_CONNECT_TIMEOUT_MS = 1000;
const DEFAULT_OPTIONS = {
    port: 1337,
    host: "localhost"
};

function prompt() {
    return inquirer.prompt([{
        type: "input",
        message: prompt,
        name: "cmd"
    }]);
}

async function tcpSendMessage(tcp, client, addonCallback) {
    client.connect();
    await tcp.once("connect", TCP_CONNECT_TIMEOUT_MS);

    const result = await new Promise((resolve, reject) => {
        tcp.sendMessage(addonCallback).subscribe(resolve, reject);
    });
    tcp.close();

    return result;
}

async function connectAgent(options = Object.create(null)) {
    const { port, host } = Object.assign({}, DEFAULT_OPTIONS, options);

    const tcp = new TcpSdk({ host, port });
    await tcp.once("connect", TCP_CONNECT_TIMEOUT_MS);
    const { version, location } = tcp.agent;
    tcp.close();
    const { client } = tcp;

    if (host === "localhost" || host === "127.0.0.1") {
        process.chdir(location);
    }


    const prompt = `${host}:${port} >`;
    let cmd;
    while (cmd !== "quit") {
        const { command } = await inquirer.prompt([{
            type: "input",
            message: prompt,
            name: "command"
        }]);
        cmd = command;

        if (cmd === "create") {
            await create();
        }

        if (cmd === "addons") {
            client.connect(port, host);
            await tcp.once("connect", TCP_CONNECT_TIMEOUT_MS);
            const addons = await tcp.getActiveAddons();
            tcp.close();

            const { addon } = await inquirer.prompt([{
                type: "list",
                message: "Choose an active addon",
                name: "addon",
                choices: addons
            }]);

            await tcp.once("connect", TCP_CONNECT_TIMEOUT_MS);
            const addonInfo = await tcpSendMessage(tcp, client, `${addon}.get_info`);
            console.log(addonInfo.callbacks);

            const { callback } = await inquirer.prompt([{
                type: "list",
                message: "Choose an active addon",
                name: "callback",
                choices: addonInfo.callbacks
            }]);
            console.log(callback);

            const callbackResult = await tcpSendMessage(tcp, client, `${addon}.${callback}`);
            console.log(callbackResult);
        }

    }

    client.close();
    console.log(`Connect to ${prompt} closed`);
}

module.exports = connectAgent;
