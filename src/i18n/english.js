"use strict";

// Require Third-party Dependencies
const { taggedString } = require("@slimio/utils");

module.exports = {
    workdir_not_agent: "Current working dir as not been detected as a SlimIO Agent",
    enter_addon_name: "Enter an addon name: ",
    adding_addon: taggedString`Adding addon '${0}'`,
    installation_completed: taggedString`installation completed in ${0} seconds`,
    not_url: "(!) Not detected as an URL.",
    slimio_supported: "Only SlimIO org repositories at currently supported by the CLI."
};
