// Require Node.js Dependencies
const { readFile, writeFile, readdir, access } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const qoa = require("qoa");
const { grey, yellow, white } = require("kleur");
const prettyJSON = require("@slimio/pretty-json");

// Require Internal Dependencies
const {
    BUILT_IN_ADDONS,
    checkBeInAgentOrAddonDir,
    commandReplExist
} = require("../src/utils");

// CONSTANTS
const REPL_COMMANDS = new Map([
    ["sync", "sync agent.json with addons folder"],
    ["addons", "Show all installed addons"],
    ["enable", "Switch on addons"],
    ["disable", "Switch off addons"],
    ["help", "Display all commands"],
    ["quit", "Quit prompt"]
]);

async function getFileAddon() {
    try {
        const file = await readFile("agent.json", { encoding: "utf8" });

        return JSON.parse(file).addons;
    }
    catch (err) {
        const addons = {};
        for (const addon of BUILT_IN_ADDONS) {
            Reflect.set(addons, addon.toLowerCase(), { active: true });
        }
        await writeFile("agent.json", JSON.stringify({ addons }, null, 4));

        return addons;
    }
}

async function getLocalAddons() {
    const addonsDir = join(process.cwd(), "addons");
    const ret = new Set();

    const dirents = await readdir(addonsDir, { encoding: "utf8", withFileTypes: true });
    for (const dirent of dirents) {
        try {
            if (!dirent.isDirectory()) {
                continue;
            }
            await access(join(addonsDir, dirent.name, "index.js"));
            ret.add(dirent.name);
        }
        catch (err) {
            continue;
        }
    }

    return ret;
}

async function fnExport(cmd, addons) {
    checkBeInAgentOrAddonDir();

    const JSON_FILE = await getFileAddon();
    const ADDONS_FILE = new Set([...Object.keys(JSON_FILE)]);
    console.log("\n > Registered addons");
    prettyJSON([...ADDONS_FILE].sort());

    const ADDONS_FROM_DIR = await getLocalAddons();
    console.log("\n > Local addons");
    prettyJSON([...ADDONS_FROM_DIR].sort());
    console.log("");

    function showREPLCommands() {
        console.log(`\n${white().bold("commands :")}`);
        for (const [command, desc] of REPL_COMMANDS) {
            console.log(`${yellow(command)}: ${desc}`);
        }
        console.log();
    }

    async function writeOnDisk() {
        await writeFile("agent.json", JSON.stringify({ addons: JSON_FILE }, null, 4));
    }

    async function splitAddons(command, ADDONS_FROM_DIR) {
        let addons;
        if (command.split(" ").length === 2) {
            [, addons] = command.split(" ");

            addons = addons.split(",").filter((add) => {
                const result = ADDONS_FROM_DIR.has(add) || ADDONS_FILE.has(add);
                if (!result) {
                    console.log(`${add} addon is not referenced`);
                }

                return result;
            });
        }
        else {
            const { addon } = await qoa.prompt([{
                type: "interactive",
                query: "Choose an addon",
                handle: "addon",
                menu: [...ADDONS_FROM_DIR]
            }]);
            addons = [addon];
            console.log("");
        }

        return addons;
    }

    async function activeSwitch(command, switcher) {
        const addons = await splitAddons(command, ADDONS_FROM_DIR);
        for (const addon of addons) {
            console.log(ADDONS_FILE);
            if (!ADDONS_FILE.has(addon)) {
                console.log(`unknow ${addon} addon`);
                continue;
            }
            Reflect.set(Reflect.get(JSON_FILE, addon), "active", switcher);
        }
        await writeOnDisk();
    }

    async function sync(command) {
        if (command.split(" ").length === 2) {
            const addons = await splitAddons(command, ADDONS_FROM_DIR);
            console.log(addons);
            console.log("");

            for (const addon of addons) {
                if (!ADDONS_FROM_DIR.has(addon)) {
                    Reflect.deleteProperty(JSON_FILE, addon);
                    console.log(`Remove ${addon} addon from agent.json`);
                    ADDONS_FILE.delete(addon);
                }
                else if (!ADDONS_FILE.has(addon)) {
                    Reflect.set(JSON_FILE, addon, { active: false });
                    ADDONS_FILE.add(addon);
                    console.log(`Create ${addon} addon in agent.json as active false`);
                }
            }
            await writeOnDisk();
        }
        else {
            console.log("Sync all dir");
            for (const addon of ADDONS_FILE) {
                if (!ADDONS_FROM_DIR.has(addon)) {
                    Reflect.deleteProperty(JSON_FILE, addon);
                    console.log(`Remove ${addon} addon from agent.json`);
                    ADDONS_FILE.delete(addon);
                }
            }
            for (const addon of ADDONS_FROM_DIR) {
                if (!ADDONS_FILE.has(addon)) {
                    Reflect.set(JSON_FILE, addon, { active: false });
                    ADDONS_FILE.add(addon);
                    console.log(`Create ${addon} addon in agent.json as active false`);
                }
            }
            await writeOnDisk();
        }
    }

    async function configure(cmd = null, addons = null) {
        if (cmd !== null) {
            // if (addons === null && cmd !== "sync") {
            //     throw new Error("Need addon name");
            // }
            const fullCommand = [cmd, addons].join(" ").trim();

            switch (cmd) {
                case "sync": {
                    await sync(fullCommand);
                    break;
                }
                case "enable": {
                    await activeSwitch(fullCommand, true);
                    break;
                }

                case "disable": {
                    await activeSwitch(fullCommand, false);
                    break;
                }
                case "addons": {
                    console.log(ADDONS_FROM_DIR);
                    break;
                }
            }

            return;
        }

        const query = grey("agent.json >");
        replWhile: while (true) {
            let { command } = await qoa.prompt([{
                type: "input", query, handle: "command"
            }]);
            command = command.trim();
            // console.log(`split command: ${command.split(" ")}`);
            if (!commandReplExist(REPL_COMMANDS, command.split(" ")[0])) {
                continue;
            }

            const cmd = command.split(" ").length === 2 ? command.split(" ")[0] : command;

            switch (cmd) {
                case "help":
                    showREPLCommands();
                    break;
                case "quit":
                    break replWhile;
                case "sync": {
                    await sync(command);
                    break;
                }
                case "enable": {
                    await activeSwitch(command, true);
                    break;
                }

                case "disable": {
                    await activeSwitch(command, false);
                    break;
                }
                case "addons": {
                    console.log(ADDONS_FROM_DIR);
                    break;
                }
            }
        }

        console.log(`REPL Connection to ${query} closed\n`);
    }
    await configure(cmd, addons);
}

module.exports = fnExport;
