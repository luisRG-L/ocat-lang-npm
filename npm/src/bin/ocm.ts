#!/usr/bin/env node

import yargs from "yargs";
import fs from "fs";
import { exec } from "child_process";
import { init as initd } from "../lang";

function init(name: string) {
    console.log(`Initializing ${name}`);
    console.time("Create Project");

    if (fs.existsSync(name)) {
        fs.rmSync(name, { recursive: true });
    }

    console.time("Folders");
    console.log();

    fs.mkdirSync(name);
    fs.mkdirSync(`${name}/src`);
    fs.mkdirSync(`${name}/lib`);
    fs.mkdirSync(`${name}/out`);
    fs.mkdirSync(`${name}/.ocat`);

    console.timeEnd("Folders");
    console.log();
    console.time("Files");

    fs.writeFileSync(`${name}/src/main.ocat`, 'print ( "Hello World" )');
    fs.writeFileSync(
        `${name}/.ocat/config.ocmn`,
        `<project name='${name}'>
    <name>${name}</name>
<project/>`
    );
    console.timeEnd("Files");
    console.log();
    console.timeEnd("Create Project");
    console.log();
    console.log();
    console.log(`Project ${name} created`);

    exec(`cd ${name}`);
}

function run() {
    initd(false, false, "./src/main.ocat");
}

yargs
    .command(
        "init <name>",
        "Initialize a new project",
        (args) => args.positional("name", { describe: "Project name" }),
        (argv) => init(argv.name as string)
    )
    .command(
        "run",
        "Run the project",
        () => {},
        () => run()
    )
    .help()
    .alias("version", "v")
    .alias("help", "h").argv;
