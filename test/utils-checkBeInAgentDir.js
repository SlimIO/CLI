"use strict";

// Require Internal Dependencies
const { checkBeInAgentDir } = require("../src/utils");

test("checkBeInAgentDir() in ./test must throw", async() => {
    expect.assertions(1);
    try {
        checkBeInAgentDir()
    }
    catch (err) {
        expect(err.message).toBe("You must be in an Agent directory");
    }
});
