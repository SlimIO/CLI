"use strict";

require("dotenv").config();

const commands = require("./commands");
Reflect.deleteProperty(commands, "connectAgent");
Reflect.deleteProperty(commands, "debug");

module.exports = commands;
