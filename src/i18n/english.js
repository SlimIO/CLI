"use strict";

// Require Third-party Dependencies
const { taggedString } = require("@slimio/utils");

module.exports = {
    add_workdir_not_agent: "Current working dir as not been detected as a SlimIO Agent",
    add_addon_name: "Enter an addon name: ",
    add_adding_addon: taggedString`Adding addon '${0}'`,
    add_error_slimio_supported: "Only SlimIO org repositories at currently supported by the CLI.",
    add_error_url_not_found: "URL hostname must be github.com",
    add_not_url: "(!) Not detected as an URL.",
    add_installation_completed: taggedString`installation completed in ${0} seconds`,

    archive_workdir_not_addon: "Current working dir as not been detected as an Addon!",
    archive_creating_success: taggedString`Successfully created ${0} addon archive at '${1}'`,
    archive_addon_archive: "For which addon(s) do you want to generate an archive ?",

    build_generate_core: taggedString`\nCore succesfully generated at: ${0}`,

    configure_unable_addon: taggedString` > Unable to found '${0}' addon`,
    configure_choose_addon: "Choose one addon on the below list",
    configure_removing_addon: taggedString`> Removing addon '${0}'`,
    configure_active_missing_addon: taggedString`> Adding missing addon '${0}' (as active: ${1})`,
    configure_add_missing_addon: taggedString`> Adding missing addon '${0}'`,
    configure_no_synchronization: " > No synchronization required.",
    configure_workdir_not_agent: "Current working dir as not been detected as a SlimIO Agent",

    // eslint-disable-next-line id-length
    connect_callback_target_undefined: " > Callback target can't be undefined",
    connect_addon_not_found: taggedString`Unable to found any addon with name '${0}'`,
    connect_addon_restarted: taggedString`addon '${0}' succesfully restarted!`,
    connect_choose_active_addon: "Choose an active addon",
    connect_choose_callback: "Choose a callback",
    connect_error: taggedString`${0}.${1} Error: ${2}`,
    connect_connected: taggedString`\n > Connected on '${0}' agent !\n`,

    create_generate_addon: taggedString`\n > '${0}' addon generated at ${1}\n`,
    create_creating: "What do you want to create ?",
    create_creating_name: "Give a name for the Addon:",
    create_add_addon: taggedString`Do you want to add '${0}' to the local agent.json ?`,
    create_project_type: "Choose the project type",
    create_toml_created: taggedString`\n > slimio.toml Manifest created at ${0}\n`,
    create_error_type_not_found: taggedString`Unknown type '${0}'`,
    create_invalid_addon_name: taggedString`invalid addon name '${0}'`,

    debug_dump_not_detected: "\n > No dump (debug dir) detected",
    debug_removing_dump: "\n > Removing all dump files in debug directory",
    debug_display_dump: taggedString`\ndump file: ${0}`,
    debug_next_question: "do you want to continue to the next dump ?",
    debug_error_dump_not_found: "no dump",

    init_install_deps: "Install dependencies",
    init_install_done: "done!",
    init_unknow: taggedString`Unknown addon set with name '${0}'`,
    init_available: taggedString` > Available sets are: ${0}`,
    init_error_not_implemented: "Not Implemented Yet",
    init_full_initialize: "\nInitialize and install a complete SlimIO Agent!",
    init_error_directory: "directoryName length must be 1 or more",
    init_additional_addon: taggedString`${0} Additional addon(s) requested: ${1}`,
    init_separator: "-----------------------------------------------",
    init_completed: taggedString`Installation completed in ${0}`,
    init_success: taggedString`\nAgent successfully installed at: ${0}`,
    init_cd: taggedString`$ cd ${0}\n`,

    remove_remove_addon: taggedString`Removing addon ${0}`,
    remove_success: taggedString`Successfully removed addon in ${0}`,
    remove_not_slimio: "Current working dir as not been detected as a SlimIO Agent",
    remove_remove_addon_ask: "which addon do you want to remove ?",
    remove_failed_remove: " > Failed to found any addon(s) to remove",
    remove_mean_question: taggedString` > Did you mean: ${0} ?`,

    start_starting: taggedString`\n > Starting SlimIO Agent with the CLI at: ${0}\n`
};
