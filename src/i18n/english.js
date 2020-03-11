/* eslint-disable max-len */
"use strict";

// Require Third-party Dependencies
const { taggedString } = require("@slimio/utils");

module.exports = {
    keywords: {
        error: "Error"
    },
    binary: {
        opt_interactive: "Enable interactive mode.",
        init_description: "Clone and install a complete SlimIO Agent.",
        init_opt_add: "Additional addons to install in addition to the built-in.",
        init_opt_set: "Choose a given set of addons.",
        init_opt_nocache: "Disable cache for archives and force download from the remote git.",
        add_description: "Add one or many addons to the local agent (Each addon are enabled by default.).",
        add_opt_disabled: "Write addons as active=false in the local agent configuration",
        remove_description: "Remove one or many addons from the local agent (erase them from the disk.).",
        create_description: "Create and/or generate SlimIO files and addons.",
        create_opt_name: "Addon name (only when addon type is 'Addon').",
        build_description: "Build and compile an agent into an executable with Node.js bundled in it.",
        archive_description: "Create an addon archive (useful to remotely deploy addons with Prism).",
        connect_description: "Connect to a local or remote SlimIO agent (must be started and use the Socket built-in Addon).",
        config_description: "Configure a local or remote running agent.",
        schema_description: "Create a config file from a JSON Schema (2019-09 draft).",
        debug_description: "Debug the local agent (navigate through local agent dump files).",
        debug_opt_clear: "Clear (erase from the disk) all local dump files.",
        lang_description: "Configure the CLI default language (which is english by default).",
        lang_selection: "What language do you want?",
        lang_registration: taggedString`'${0}' has been selected as the new CLI language!`,
        start_description: "Start the local agent with advanced debugging and logging utilities.",
        set_description: "Setup and/or configure a given setting in the local cache.",
        set_unknown_settings: taggedString`Unknown setting key '${0}' !`,
        set_available_keys: "Available keys are",
        set_success_write: taggedString`Successfully writed ${0} = ${1} in the local cache !`,
        get_description: taggedString`Get one or all keys stored in the local cache (return all keys if no argument is given).\nAvailable settings keys are: \n\t- ${0}`,
        get_settings: "- Local CLI settings -"
    },
    interactive: {
        leaving: "leaving interactive mode with no addons !",
        ask_to_leave: "Do you want to leave interactive mode ?"
    },
    utils: {
        mustbe_agentdir: "You must be in an Agent directory",
        mustbe_agent_or_subdir: "You must be in an Agent or one of the sub directory",
        clone_install: "Clone and install..."
    },
    REPL: {
        available_commands: "available commands",
        help_cmd: "display all available commands in the current REPL",
        quit_cmd: "exit the current REPL",
        json_cmd: "enable or disable JSON output",
        unknown_cmd: taggedString`Unknown command '${0}'`,
        did_you_mean: taggedString`Did you mean: ${0} ?`,
        connection_closed: taggedString`REPL Connection to ${0} closed`
    },
    agentConfig: {
        addonWritten: taggedString`Writing (adding) addon in the local configuration '${0}'`
    },

    add_workdir_not_agent: "Current working dir as not been detected as a SlimIO Agent",
    add_addon_name: "Search for an addon in the Registry: ",
    add_adding_addon: taggedString`Adding addon '${0}'`,
    add_error_slimio_supported: "Only SlimIO org repositories is currently supported by the CLI.",
    add_error_url_not_found: "URL hostname must be github.com",
    add_not_url: "(!) Not detected as an URL.",
    add_installation_completed: taggedString`installation completed in ${0} seconds`,

    archive_workdir_not_addon: "Current working dir as not been detected as an Addon !",
    archive_creating_success: taggedString`Successfully created ${0} addon archive at '${1}'`,
    archive_addon_archive: "For which addon(s) do you want to generate an archive ?",

    build_generate_core: taggedString`Core succesfully generated at: ${0}`,

    configure_unable_addon: taggedString` > Unable to found '${0}' addon`,
    configure_choose_addon: "Choose one addon on the below list",
    configure_removing_addon: taggedString`> Removing addon '${0}'`,
    configure_active_missing_addon: taggedString`> Adding missing addon '${0}' (as active: ${1})`,
    configure_add_missing_addon: taggedString`> Adding missing addon '${0}'`,
    configure_no_synchronization: " > No synchronization required.",
    configure_workdir_not_agent: "Current working dir as not been detected as a SlimIO Agent",

    // eslint-disable-next-line id-length
    connect_callback_target_undefined: "Callback target can't be undefined",
    connect_addon_not_found: taggedString`Unable to found any addon with name '${0}'`,
    connect_addon_restarted: taggedString`addon '${0}' succesfully restarted!`,
    connect_choose_active_addon: "Choose an active addon",
    connect_choose_callback: "Choose a callback",
    connect_error: taggedString`${0}.${1} Error: ${2}`,
    connect_connected: taggedString`Connected on '${0}' agent !`,

    create_generate_addon: taggedString`'${0}' addon generated at ${1}`,
    create_creating: "What do you want to create ?",
    create_creating_name: "Give a name for the Addon:",
    create_add_addon: taggedString`Do you want to add '${0}' to the local agent.json ?`,
    create_project_type: "Choose the project type",
    create_toml_created: taggedString`slimio.toml Manifest created at ${0}`,
    create_error_type_not_found: taggedString`Unknown type '${0}'`,
    create_invalid_addon_name: taggedString`invalid addon name '${0}'`,

    debug_dump_not_detected: "No dump (debug dir) detected",
    debug_removing_dump: "Removing all dump files in debug directory",
    debug_display_dump: taggedString`dump file: ${0}`,
    debug_next_question: "do you want to continue to the next dump ?",
    debug_error_dump_not_found: "no dump",

    init_warning: "!! Warning",
    init_install_deps: "Install dependencies",
    init_install_done: "done !",
    init_unknow: taggedString`Unknown addon set with name '${0}'`,
    init_available: taggedString` > Available sets are: ${0}`,
    init_error_not_implemented: "Not Implemented Yet",
    init_full_initialize: "Initialize and install a complete SlimIO Agent!",
    init_error_directory: "directoryName length must be 1 or more",
    init_additional_addon: taggedString`${0} Additional addon(s) requested: ${1}`,
    init_separator: "-----------------------------------------------",
    init_completed: taggedString`Installation completed in ${0}`,
    init_success: taggedString`Agent successfully installed at: ${0}`,
    init_cd: taggedString`$ cd ${0}`,

    remove_remove_addon: taggedString`Removing addon ${0}`,
    remove_success: taggedString`Successfully removed addon in ${0}`,
    remove_not_slimio: "Current working dir as not been detected as a SlimIO Agent",
    remove_remove_addon_ask: "which addon do you want to remove ?",
    remove_failed_remove: "Failed to found any addon(s) to remove",
    remove_mean_question: taggedString`Did you mean: ${0} ?`,

    schema_no_config: "Manifest does not contain config !",

    start_starting: taggedString`Starting SlimIO Agent with the CLI at: ${0}`
};
