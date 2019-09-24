"use strict";

// Require Node.js Dependencies
const { join } = require("path");

// Require Third-party Dependencies
const is = require("@slimio/is");

// Require Internal Dependencies
const { directoryMustNotExist } = require("../src/utils");

test("root /foo directory must not exist", async() => {
    const ret = await directoryMustNotExist(join(__dirname, "foo"));
    expect(ret).toStrictEqual(void 0);
});

test("root /fixtures directory must exist", async() => {
    expect.assertions(1);
    try {
        await directoryMustNotExist(join(__dirname, "fixtures"));
    }
    catch (err) {
        expect(is.string(err.message)).toBe(true);
    }
});
