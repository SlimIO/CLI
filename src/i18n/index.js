"use strict";

// Require Third-party Depedencies
const cacache = require("cacache");
const get = require("lodash.get");

// CONSTANTS
const CACHE_PATH = "/tmp/slimio-cli";
const DEFAULT_LANG = "english";

const TOKENS = {
    // eslint-disable-next-line global-require
    english: require("./english.js")
};

// VARS
let LANG_UPDATED = true;
let localLang = DEFAULT_LANG;

/**
 * @async
 * @function getLocalLang
 * @returns {string}
 */
async function getLocalLang() {
    if (LANG_UPDATED) {
        try {
            const { data } = await cacache.get(CACHE_PATH, "cli-lang");
            localLang = data.toString();
        }
        catch (error) {
            await cacache.put(CACHE_PATH, "cli-lang", DEFAULT_LANG);
            localLang = DEFAULT_LANG;
        }
        LANG_UPDATED = false;
    }

    return localLang;
}

/**
 * @async
 * @function getToken
 * @param {string} token lang token
 * @param {any[]} params
 * @returns {string}
 *
 * @throws {TypeError}
 */
async function getToken(token, ...params) {
    if (typeof token !== "string") {
        throw new TypeError("token must be a string");
    }

    const lang = await getLocalLang();
    if (!Reflect.has(TOKENS, lang)) {
        return `Invalid i18n lang -> ${lang}`;
    }

    if (!Reflect.has(TOKENS[lang], token)) {
        return `Invalid i18n token -> ${token} for lang -> ${lang}`;
    }
    const langToken = get(TOKENS[lang], token);

    return params.length === 0 ? langToken : langToken(...params);
}

module.exports = {
    getToken,
    CONSTANTS: { LANG_UPDATED }
};
