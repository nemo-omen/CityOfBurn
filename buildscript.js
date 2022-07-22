import fs from "fs";
import esbuild from "esbuild";
import esbuildSvelte from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";

//make sure the directoy exists before stuff gets put into it
if (!fs.existsSync("./public/")) {
    fs.mkdirSync("./public/");
}
esbuild
    .build({
        entryPoints: [`./client/main.ts`],
        bundle: true,
        outdir: `./public`,
        mainFields: ["svelte", "browser", "module", "main"],
        // logLevel: `info`,
        minify: false, //so the resulting code is easier to understand
        sourcemap: "inline",
        splitting: true,
        write: true,
        format: `esm`,
        watch: true,
        plugins: [
            esbuildSvelte({
                preprocess: sveltePreprocess(),
            }),
        ],
    })
    .catch((error, location) => {
        console.warn(`Errors: `, error, location);
        process.exit(1);
    });

//use a basic html file to test with
fs.copyFileSync("./client/index.html", "./public/index.html");
fs.copyFileSync("./client/script/refresh.js", "./public/script/refresh.js");
fs.copyFileSync("./client/favicon.svg", "./public/favicon.svg");