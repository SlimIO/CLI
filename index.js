const commands = require("./commands");
Reflect.deleteProperty(commands, "connect");

module.exports = commands;
