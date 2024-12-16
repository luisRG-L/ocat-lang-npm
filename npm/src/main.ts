#!/usr/bin/env node

import { init } from "./lang";
import yargs from "yargs";

yargs
    .command(
        "$0 <file>",
        "Run a file",
        (args) =>
            args
                .positional("file", {
                    describe: "File to run",
                    type: "string",
                })
                .option("test", {
                    alias: "t",
                    type: "boolean",
                    description: "Run in test mode",
                })
                .option("dev", {
                    alias: "d",
                    type: "boolean",
                    description: "Run in dev mode",
                }),
        (argv) => {
            const { file, test, dev } = argv;
            init(test ?? false, dev ?? false, file ?? "main.ocat");
        }
    )
    .demandCommand(1, "You need to provide a command")
    .help()
    .alias('version', 'v')
    .alias("help", "h").argv;
