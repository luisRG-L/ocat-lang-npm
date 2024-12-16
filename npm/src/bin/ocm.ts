#!/usr/bin/env node

import yargs from "yargs";
import fs from "fs";
import { exec } from "child_process";
import { init as initd } from "../lang";
import { readFile } from "../runner/utils";
import { code404, codeRouteTemplate, preJs, preStyles} from "../runner/constants";

// Functions
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
    fs.mkdirSync(`${name}/css`);
    fs.mkdirSync(`${name}/assets`);
    fs.mkdirSync(`${name}/templates`);

    console.timeEnd("Folders");
    console.log();
    console.time("Files");

    fs.writeFileSync(`${name}/.ocat/ocat.json`, 
`{
    "name": "${name}",
    "port": 8080,
	"properties": {
		"defined": {},
		"provided": []
	},
	"path": {
		"@/": "./src/"
	}
}`);
    fs.writeFileSync(`${name}/src/main.ocat`, 'print ( "Hello World" )');
    fs.writeFileSync(`${name}/css/style.css`, preStyles);
    fs.writeFileSync(`${name}/css/globals.css`, '/* Set here your styles */');
    fs.writeFileSync(`${name}/assets/ocat.js`, preJs);
    fs.writeFileSync(`${name}/templates/404.html`, code404);
    fs.writeFileSync(`${name}/templates/routeTemplate.html`, codeRouteTemplate);
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

function newComponent (type: string, name: string) {
    const path = `./src/${type}s/${name}/${name}`;
    if (fs.existsSync(path)) {
        console.log(`${type} ${name} already exists`);
        return;
    }
    let content = '';
    if (type === 'component') {
        content = `<title>${name}</title>\n<div>Component works!</div>`;
    } else if (type === 'layout') {
        content = `<div></div>{*children*}`;
    }
    if (!fs.existsSync(`./src/${type}s`)) {
        fs.mkdirSync(`./src/${type}s`);
    }
    fs.mkdirSync(`./src/${type}s/${name}`);
    fs.writeFileSync(path + ".component.html", content);
    fs.writeFileSync(path + ".component.css", '/* Put your styles here */');
    console.log(`${type} ${name} created`);
}

function AMPath(path: string, to: string) {
    const pathJson = JSON.parse(readFile("./.ocat/ocat.json") ?? '{}');
    const hasPath = pathJson["path"].hasOwnProperty(path);
    pathJson["path"][path] = to;
    fs.writeFileSync("./.ocat/ocat.json", JSON.stringify(pathJson, null, 4));
    console.log(`Path ${path} ${hasPath ? "changed" : "added"} to ${to}`);
}

function delComponent (name: string) {
    const path = `./src/components/${name as string}`;
    if (fs.existsSync(path)) {
        fs.rmSync(path, { recursive: true });
        console.log(`${name} deleted`);
    } else {
        console.log(`${name} not found`);
    }
}

function modifyPort (port: number) {
    const config = JSON.parse(readFile('./.ocat/config.json') ?? '{}');
    config.port = port;
    fs.writeFileSync('./.ocat/config.json', JSON.stringify(config, null, 4));
    console.log(`Port modified to ${port}`);
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
    .command(
        'new <type> <name>',
        'Create a new component or layout',
        (args) => args.positional('type', { describe: 'Component or layout' }).positional('name', { describe: 'Name of the component or layout' }),
        (argv) => newComponent(argv.type as string, argv.name as string)
    )
    .command(
        "del <name>",
        "Delete a component",
        (args) => args.positional("name", { describe: "Name of the component" }),
        (argv) => delComponent(argv.name as string)
    )
    .command(
        "path <path> <to>",
        "Add or change a RelPath",
        (args) => args.positional("path", { describe: "Path to change" }).positional("to", { describe: "New path" }),
        (argv) => AMPath(argv.path as string, argv.to as string)
    )
    .command(
        "port <port>",
        "Modify the port",
        (args) => args.positional("port", { describe: "New port" }),
        (argv) => modifyPort(argv.port as number)
    )
    .help()
    .alias("version", "v")
    .alias("help", "h").argv;
