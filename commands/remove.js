"use strict";

// Require Third-party Dependencies
const premove = require("premove");

// Require Internal Dependencies
const { checkBeInAgentOrAddonDir } = require("../src/utils");

/**
 * @async
 * @function remove
 * @param {string[]} [addons]
 * @returns {Promise<void>}
 */
async function remove(addons = []) {
    checkBeInAgentOrAddonDir();
}

module.exports = remove;
