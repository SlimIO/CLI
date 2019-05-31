// Require Node.js Dependencies
const { join } = require("path");
const { promisify } = require("util");

// Require Third-party Dependencies
const { yellow, red, white } = require("kleur");
const osService = require("os-service");
const isElevated = require("is-elevated");

// Require Internal Dependencies
const { checkBeInAgentDir } = require("../src/utils");

// CONSTANTS
const SERVICE_NAME = "SlimIO Agent";

// ASYNC METHODS
const add = promisify(osService.add);
const remove = promisify(osService.remove);

async function service(action = "add") {
    checkBeInAgentDir();
    console.log(white().bold(`Service command triggered with action: ${yellow().bold(action)}`));

    const isAdministrator = await isElevated();
    if (!isAdministrator) {
        console.log(red().bold("Terminal must be run as Administrator to register a Service on the system!"));

        return;
    }

    // Service options
    const options = {
        programPath: join(process.cwd(), "index.js")
    };

    switch (action) {
        case "add":
            await add(SERVICE_NAME, options);
            break;
        case "rm":
        case "remove":
            await remove(SERVICE_NAME);
            break;
        default:
            console.log(red().bold(`Unknown action '${yellow().bold(action)}'`));
            break;
    }
}

module.exports = service;
