// Require Third-party Dependencies
const TcpSdk = require("@slimio/tcp-sdk");

// CONSTANTS
const TCP_CONNECT_TIMEOUT_MS = 1000;

async function connectAgent(connect) {
    const client = new TcpSdk(connect);

    await client.once("connect", TCP_CONNECT_TIMEOUT_MS);

    console.log(client.agent);
    // working with inquirer
}

module.exports = connectAgent;
