// Require Third-party Dependencies
const lazy = require("@slimio/lazy");

const commands = lazy.of({});

/* eslint-disable global-require */
commands.set("initAgent", () => require("./init"));
commands.set("addAddon", () => require("./addAddon"));
commands.set("create", () => require("./create"));
// commands.set("service", () => require("./service"));
commands.set("build", () => require("./build"));
commands.set("connectAgent", () => require("./connect"));
commands.set("configure", () => require("./configure"));

module.exports = commands.value;
