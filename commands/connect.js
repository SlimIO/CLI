// Require Third-party Dependencies
const TcpSdk = require("@slimio/tcp-sdk");
const qoa = require("qoa");
const { grey, yellow, white, cyan, red } = require("kleur");
const prettyJSON = require("@slimio/pretty-json");
const levenshtein = require("fast-levenshtein");

// Require Internal Dependencies
const create = require("./create");

// CONSTANTS
const TCP_CONNECT_TIMEOUT_MS = 1000;
const DEFAULT_OPTIONS = {
    port: 1337,
    host: "localhost"
};
const REPL_COMMANDS = new Map([
    ["addons", "Call an addon's callback"],
    ["create", "Create a default addon or manifest"],
    ["help", "Display all commands"],
    ["quit", "Quit prompt"]
]);
const CMD_ARR = [...REPL_COMMANDS.keys()];

function showREPLCommands() {
    console.log(`\n${white().bold("commands :")}`);
    for (const [command, desc] of REPL_COMMANDS) {
        console.log(`${yellow(command)}: ${desc}`);
    }
    console.log();
}

async function tcpSendMessage(client, addonCallback) {
    await client.connect(TCP_CONNECT_TIMEOUT_MS);

    const result = await new Promise((resolve, reject) => {
        client.sendMessage(addonCallback).subscribe(resolve, reject);
    });
    client.close();

    return result;
}

async function connectAgent(options = Object.create(null)) {
    const { host, port } = Object.assign({}, DEFAULT_OPTIONS, options);

    const client = new TcpSdk({ host, port });
    await client.once("connect", TCP_CONNECT_TIMEOUT_MS);
    const { location } = client.agent;
    client.close();

    if (host === "localhost" || host === "127.0.0.1") {
        process.chdir(location);
    }

    console.log(yellow().bold(`Connected on '${host}' agent !\n`));
    const query = grey(`${host}:${port} >`);
    replWhile: while (true) {
        const { command } = await qoa.prompt([{
            type: "input", query, handle: "command"
        }]);

        if (!REPL_COMMANDS.has(command)) {
            const isMatching = [];
            for (const item of CMD_ARR) {
                const count = levenshtein.get(item, command);
                if (count <= 2) {
                    isMatching.push(item);
                }
            }

            console.log(red().bold(`\nUnknown command '${yellow().bold(command)}'`));
            if (isMatching.length > 0) {
                const words = isMatching.map((row) => cyan().bold(row)).join(",");
                console.log(white().bold(`Did you mean: ${words} ?\n`));
            }
            continue;
        }

        switch (command) {
            case "help":
                showREPLCommands();
                break;
            case "quit":
                break replWhile;
            case "create":
                await create();
                break;
            case "addons": {
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
                prettyJSON(callbackResult);
                console.log("");
                break;
            }
        }
    }

    client.close();
    console.log(`REPL Connection to ${query} closed\n`);
}

module.exports = connectAgent;
