const { readdir } = require("fs").promises;
const { compile } = require("nexe");

async function build() {
    // const files = await readdir("./addons");
    // console.log(files);
    compile({
        input: "./index.js",
        build: true
        // patches: [
        //     async(compiler, next) => {
        //         try {
        //             await compiler.setFileContentsAsync(
        //                 ...files.map((dir) => `addons/${dir}/index.js`)
        //             );
        //         }
        //         catch (err) {
        //             // ignore
        //         }

        //         return next();
        //     }
        // ]
    }).then(() => {
        console.log("success");
    }).catch(console.error);
}

module.exports = build;
