// Require Third-party Dependencies
const TcpSdk = require("@slimio/tcp-sdk");
const inquirer = require("inquirer");

// Require Internal Dependencies
const create = require("./create");
// CONSTANTS
const TCP_CONNECT_TIMEOUT_MS = 1000;

function prompt() {
    return inquirer.prompt([{
        type: "input",
        message: prompt,
        name: "cmd"
    }]);
}


async function connectAgent(connect) {
    const client = new TcpSdk(connect);
    await client.once("connect", TCP_CONNECT_TIMEOUT_MS);

    const prompt = `localhost:${connect} >`;

    console.log(client.agent);
    const { agent: { version, location } } = client;

    process.chdir(location);

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
            const addons = await client.getActiveAddons();
            const { addon } = await inquirer.prompt([{
                type: "list",
                message: "Choose an active addon",
                name: "addon",
                choices: addons
            }]);

            const addonInfo = await new Promise((resolve, reject) => {
                client.sendMessage(`${addon}.get_info`).subscribe(resolve, reject);
            });
            console.log(addonInfo.callbacks);

            const { callback } = await inquirer.prompt([{
                type: "list",
                message: "Choose an active addon",
                name: "callback",
                choices: addonInfo.callbacks
            }]);
            console.log(callback);

            const callbackResult = await new Promise((resolve, reject) => {
                client.sendMessage(`${addon}.${callback}`).subscribe(resolve, reject);
            });
            console.log(callbackResult);
        }
    }

    client.close();
    console.log(`Connect to ${prompt} closed`);
}

module.exports = connectAgent;
