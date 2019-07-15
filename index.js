"use strict";

require("dotenv").config();

const commands = require("./commands");
Reflect.deleteProperty(commands, "connectAgent");

module.exports = commands;
