#!/usr/bin/env node	

import { init } from './lang.js';

const cmd1 = process.argv[2];

let test: boolean = false;
let dev: boolean = false;

let project: boolean = false;
let index: number = 2;

if (cmd1.startsWith('--')) {
    const command = cmd1.replace('--', '');
    switch (command) {
        case 'test':
            console.log('Uploading mode: test');
            test = true;
            break;
        case 'dev':
            console.log('Uploading mode: dev');
            dev = true;
            break;

        case 'devtest':
            console.log('Uploading mode: dev-test');
            dev = true;
            test = true;
            break;

        case 'help':
            console.log('Help');
            console.log('Usage: ocat [--test|--dev|--dev-test] <file.ocat>');
            break;

        case 'version':
            console.log('Version: 0.0.1');
            break;

        case 'project':
            console.log("Running complete project");
            project = true;
            break;

        case 'cp':
            console.log("Creating files");
            break;

        default:
            console.log('Unknown command');
            break;
    }
    index = 3;
}


const filePath = project ? 'src/main.ocat' : process.argv[index];

init(test, dev, filePath);