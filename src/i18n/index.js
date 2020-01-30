/* eslint-disable global-require */
"use strict";

// Require Third-party Depedencies
const cacache = require("cacache");
const is = require("@slimio/is");
const get = require("lodash.get");

// CONSTANTS
const CACHE_PATH = "/tmp/slimio-cli";
const DEFAULT_LANG = "english";

const TOKENS = {
    english: require("./english.js"),
    french: require("./french.js")
};

// VARS
let LANG_UPDATED = true;
let localLang = DEFAULT_LANG;

/**
 * @async
 * @function getLocalLang
 * @returns {string}
 */
function getLocalLang() {
    if (LANG_UPDATED) {
        try {
            const { data } = cacache.get.sync(CACHE_PATH, "cli-lang");
            localLang = data.toString();
        }
        catch (error) {
            cacache.put(CACHE_PATH, "cli-lang", DEFAULT_LANG);
            localLang = DEFAULT_LANG;
        }
        LANG_UPDATED = false;
    }

    return localLang;
}

/**
 * @function getToken
 * @param {string} token lang token
 * @param {any[]} params
 * @returns {string}
 *
 * @throws {TypeError}
 */
function getToken(token, ...params) {
    if (typeof token !== "string") {
        throw new TypeError("token must be a string");
    }

    const lang = getLocalLang();
    if (!Reflect.has(TOKENS, lang)) {
        return `Invalid i18n lang -> ${lang}`;
    }

    const langToken = get(TOKENS[lang], token);
    if (is.nullOrUndefined(langToken)) {
        return `Invalid i18n token -> ${token} for lang -> ${lang}`;
    }

    return params.length === 0 ? langToken : langToken(...params);
}

module.exports = {
    getToken,
    getLocalLang,
    CONSTANTS: { LANG_UPDATED }
};
