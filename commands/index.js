"use strict";

// Require Third-party Dependencies
const lazy = require("@slimio/lazy");

const commands = lazy.of({});

/* eslint-disable global-require */
commands.set("initAgent", () => require("./init"));
commands.set("add", () => require("./add"));
commands.set("remove", () => require("./remove"));
commands.set("create", () => require("./create"));
commands.set("build", () => require("./build"));
commands.set("connectAgent", () => require("./connect"));
commands.set("configure", () => require("./configure"));
commands.set("start", () => require("./start"));

module.exports = commands.value;
