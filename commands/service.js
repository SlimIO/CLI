// Require Node.js Dependencies
const { join } = require("path");

// Require Third-party Dependencies
const osService = require("os-service");
const { checkBeInAgentDir } = require("../src/utils");

const SERVICE_NAME = "SlimIO";

function service(arg) {
    checkBeInAgentDir();

    const options = {
        programArgs: join(process.cwd(), "index.js")
    };

    if (arg === "add") {
        osService.add(SERVICE_NAME, options, (err) => {
            if (err) {
                console.trace(err);
            }
            else {
                console.log("added");
                osService.run(() => {
                    osService.stop(0);
                });
                // service.remove("service1", (err) => {
                //     if (err) {
                //         console.trace(err);
                //     }
                // });
            }
        });
    }
    else if (arg === "rm") {
        osService.remove(SERVICE_NAME, (err) => {
            if (err) {
                console.trace(err);
            }
            else {
                console.log("removed");
            }
        });
    }
    // else if (arg === "run") {
    //     console.log("start run");
    //     osService.run(() => {
    //         osService.stop(0);
    //     });
    // }
    // else if (arg === "stop") {
    //     osService.stop(0);
    // }
    else {
        console.log("no valid arg");
    }
}

module.exports = service;
