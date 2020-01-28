/* eslint-disable max-len */
"use strict";

// Require Third-party Dependencies
const { taggedString } = require("@slimio/utils");

module.exports = {
    binary: {
        opt_interactive: "Activation du mode interactif",
        init_description: "Clone & installe un Agent SlimIO complet.",
        init_opt_add: "Addons additionnels à installer avec le built-in",
        init_opt_set: "Choisissez un panier d'addons",
        init_opt_nocache: "Désactivation du cache pour les archives et force le téléchargement sur le git distant",
        add_description: "Ajoute un ou plusieurs addon(s) dans l'agent local (Addon activé par défaut).",
        add_opt_disabled: "Ecrit les addons comme étant actif: false dans agent.json",
        remove_description: "Retire un ou plusieurs addon(s) de l'agent local (Efface du disque).",
        create_description: "Créer et/ou génère des fichiers et des addons.",
        create_opt_name: "Nom de l'addon (Seulement si le type est Addon)",
        build_description: "Construit et compile un agent dans un executable avec Node.js paqueté dedans.",
        archive_description: "Créer une archive d'addon (utile pour déployer des addons avec Prism à distance).",
        connect_description: "Connexion à un agent SlimIO local ou distant (l'addon built-in Socket doit être démarrer).",
        config_description: "Configure un agent local ou distant en fonctionnement.",
        schema_description: "Créer une config à partir d'un Json Schema",
        debug_description: "Debug un agent local (naviguer au travers des fichiers dumps locals de l'agent)",
        debug_opt_clear: "Nettoie (Efface du disque) tous les fichiers dump",
        start_description: "Démarre l'agent local avec debugging avancé et du logging utilitaire.",
        set_description: "Configure/Créer une option dans le cache local.",
        set_unknown_settings: taggedString`Clé d'option '${0}' inconnue !`,
        set_available_keys: "Les clés valides sont",
        set_success_write: taggedString`Ecriture de ${0} = ${1} dans le cache local réalisé avec succès !`,
        get_description: taggedString`Donne une ou toutes les clés conservées dans le cache local (renvoie toutes les clés si aucun argument est spécifié).\nClés d'options valides: \n\t- ${0}`,
        get_settings: "- Options locales -"
    },
    interactive: {
        leaving: "Vous quittez le mode intéractif sans addons !",
        ask_to_leave: "Voulez-vous quitté le mode intéractif ?"
    },
    utils: {
        mustbe_agentdir: "Vous devez être dans le dossier d'un agent",
        mustbe_agent_or_subdir: "Vous devez être dans le dossier d'un agent ou un des sous dossier"
    },
    REPL: {
        available_commands: "Commandes valides",
        help_cmd: "Affiche toutes les commandes valides dans le REPL actuel",
        quit_cmd: "Quitte le REPL",
        json_cmd: "Active ou désactive la sortie JSON",
        unknown_cmd: taggedString`Commande '${0}' inconnue`,
        did_you_mean: taggedString`Vouliez-vous dire: ${0} ?`,
        connection_closed: taggedString`Connexion REPPL à ${0} terminé`
    },

    add_workdir_not_agent: "Le dossier de travail actuel n'est pas détecté comme étant un agent SlimIO",
    add_addon_name: "Recherche d'un addon dans le Registry: ",
    add_adding_addon: taggedString`Ajout de l'addon '${0}'`,
    add_error_slimio_supported: "Seulement les répertoires de l'orga SlimIO sont supportés par le CLI actuellement.",
    add_error_url_not_found: "URL hostname doit être github.com",
    add_not_url: "(!) N'est pas détecté en tant qu'URL.",
    add_installation_completed: taggedString`installation completé en ${0} secondes`,

    archive_workdir_not_addon: "Le dossier de travail actuel n'est pas détecté en tant qu'Addon !",
    archive_creating_success: taggedString`Archive d'addon ${0} dans '${1}' créer avec succès`,
    archive_addon_archive: "Pour quel(s) addon(s) souhaitez-vous générer une archive ?",

    build_generate_core: taggedString`Génération du Core dans ${0} réalisé avec succès`,

    configure_unable_addon: taggedString` > Addon '${0}' impossible à trouver`,
    configure_choose_addon: "Choisissez un addon dans la list ci-dessous",
    configure_removing_addon: taggedString`> Addon '${0}' retiré`,
    configure_active_missing_addon: taggedString`> Ajout de l'addon manquant '${0}' (en tant qu'active: ${1})`,
    configure_add_missing_addon: taggedString`> Ajout de l'addon manquant '${0}'`,
    configure_no_synchronization: " > Aucune synchronization requise.",
    configure_workdir_not_agent: "Le dossier de travail actuel n'est pas détecté comme étant un agent SlimIO",

    // eslint-disable-next-line id-length
    connect_callback_target_undefined: "La cible du Callback ne peut pas être indéfinie",
    connect_addon_not_found: taggedString`Impossible de trouver un addon avec le nom '${0}'`,
    connect_addon_restarted: taggedString`addon '${0}' relancé avec succès!`,
    connect_choose_active_addon: "Choisissez un addon actif",
    connect_choose_callback: "Choisissez un Callback",
    connect_error: taggedString`${0}.${1} Erreur: ${2}`,
    connect_connected: taggedString`Connecté sur l'agent '${0}' !`,

    create_generate_addon: taggedString`Addon '${0}' généré dans ${1}`,
    create_creating: "Que voulez-vous créer ?",
    create_creating_name: "Donnez un nom pour l'Addon:",
    create_add_addon: taggedString`Voulez-vous ajouter '${0}' dans l'agent.json local?`,
    create_project_type: "Choisissez le type de projet",
    create_toml_created: taggedString`Manifest slimio.toml créé dans ${0}`,
    create_error_type_not_found: taggedString`Type '${0}' inconnu`,
    create_invalid_addon_name: taggedString`Nom d'addon '${0}' invalide`,

    debug_dump_not_detected: "Aucun dump (dossier debug) detecté",
    debug_removing_dump: "Supprime tous les fichiers dump dans le dossier debug",
    debug_display_dump: taggedString`Fichier dump: ${0}`,
    debug_next_question: "Voulez-vous continuer sur le dump suivant ?",
    debug_error_dump_not_found: "Aucun dump",

    init_install_deps: "Installe les dépendences",
    init_install_done: "Fait !",
    init_unknow: taggedString`Nom d'ensemble d'addon '${0}' inconnu`,
    init_available: taggedString` > Ensembles valide: ${0}`,
    init_error_not_implemented: "Pas encore implémenté",
    init_full_initialize: "Initialise et installe un Agent SlimIO complet !",
    init_error_directory: "La longueur du directoryName doit être de 1 ou plus",
    init_additional_addon: taggedString`${0} Addon(s) additionnel(s) demandé(s): ${1}`,
    init_separator: "-----------------------------------------------",
    init_completed: taggedString`Installation completé en ${0}`,
    init_success: taggedString`Agent installé dans : ${0} avec succès`,
    init_cd: taggedString`$ cd ${0}`,

    remove_remove_addon: taggedString`Addon ${0} supprimé`,
    remove_success: taggedString`Addon supprimé avec succès en ${0}`,
    remove_not_slimio: "Le dossier de travail actuel n'est pas détecté comme étant un agent SlimIO",
    remove_remove_addon_ask: "Quel addon voulez-vous supprimer?",
    remove_failed_remove: "Impossible de trouver l'addon à supprimer",
    remove_mean_question: taggedString`Voulez-vous dire: ${0} ?`,

    schema_no_config: "Le Manifest ne contient pas de config !",

    start_starting: taggedString`Démarrage de l'Agent SlimIO avec le CLI de : ${0}`
};
