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
    fs.mkdirSync(`${name}/css`);
    fs.mkdirSync(`${name}/assets`);

    console.timeEnd("Folders");
    console.log();
    console.time("Files");

    fs.writeFileSync(`${name}/.ocat/path.json`, '{"@/":"./src/"}');
    fs.writeFileSync(`${name}/src/main.ocat`, 'print ( "Hello World" )');
    fs.writeFileSync(
        `${name}/.ocat/config.ocmn`,
        `<project name='${name}'>
    <name>${name}</name>
<project/>`
    );
    fs.writeFileSync(`${name}/css/style.css`, 'body{margin:0;padding:0;}.--ocat-dev-var-tool{position:fixed;display:flex;bottom:0;width:100%;justify-content:center;align-items:center;}.oc-container{display:flex;justify-content:center;align-items:center;}');
    fs.writeFileSync(`${name}/assets/ocat.js`, 'class OCC extends HTMLElement{constructor(){super();}connectedCallback(){this.innerHTML=`<div class="oc-container">${super.innerHTML}</div>`;}}customElements.define("oc-c",OCC);');
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

const newComponent = (type: string, name: string) => {
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
        (argv) => {
            const path = `./src/components/${argv.name as string}`;
            if (fs.existsSync(path)) {
                fs.rmSync(path, { recursive: true });
                console.log(`${argv.name} deleted`);
            } else {
                console.log(`${argv.name} not found`);
            }
        }
    )
    .help()
    .alias("version", "v")
    .alias("help", "h").argv;
