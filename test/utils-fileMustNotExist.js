"use strict";

// Require Node.js Dependencies
const { join } = require("path");

// Require Third-party Dependencies
const is = require("@slimio/is");

// Require Internal Dependencies
const { fileMustNotExist } = require("../src/utils");

test("file foo.js must not exist", async() => {
    const ret = await fileMustNotExist(join(__dirname, "foo.js"));
    expect(ret).toStrictEqual(void 0);
});

test("file utils-directoryMustNotExist.js must exist", async() => {
    expect.assertions(1);
    try {
        const filep = join(__dirname, "utils-directoryMustNotExist.js");
        await fileMustNotExist(filep);
    }
    catch (err) {
        expect(is.string(err.message)).toBe(true);
    }
});
