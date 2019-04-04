
// Require Third-party Dependencies
const TcpSdk = require("@slimio/tcp-sdk");

async function connectAgent(connect) {

    const client = new TcpSdk(connect);

    await client.once("connect", TCP_CONNECT_TIMEOUT_MS);

    console.log(client.agent);
    // working with inquirer
}

module.exports = connectAgent;
