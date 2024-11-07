import { Node, NodeType } from './parser/types';
import { error } from '../error/error';
import { Memory } from '../memory/';
import { print } from '../print/';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import { init } from '../lang';
import { exec } from 'child_process';


const memory: Memory = new Memory();
const configPath = path.resolve(__dirname, '../../json/config.json'); // TODO: Change this path
const data = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(data);

let index: number = 0;
const routes: { name: string; result: string }[] = [];

const app = express();

let styles = '';

export const run = (nodes: Node[]): void => {
    nodes.forEach((node) => {
        switch (node.type) {
            case NodeType.OUTPUT:
                if (node.params.content?.startsWith("\\")) {
                    //const command = node.params.content.replace("\\", "");
                    //print(commandite(command, node));
                } else {
                    print(node.params.content);
                }
                break;

            case NodeType.ERR:
                error(node.params.cause);
                break;

            case NodeType.DECLARE:
                memory.declareVar(node.params.name, node.params.value, node.params.type);
                break;

            case NodeType.IF:
                // Falta la lógica para el manejo del IF.
                break;

            case NodeType.SHOW:
                {
                const route = '/'+node.params.route||`/404/${++index}`;
                const processedContent = processHTML(node.params.content);
                app.get(route, (req, res) => {
                    res.send(processedContent);
                });
                routes.push({ name: route, result: `<style>${styles}</style>${processedContent}`});
                break; }

            case NodeType.STYLE:
                styles = node.params.content || '* { box-sizing: border-box; }';
                break;

            case NodeType.IMPORT:
                init(false, false, './'+node.params.name || './lib/main.ocat');
                break;

            case NodeType.CDECLARE:
                memory.declareComponent(node.params.name, node.params.content);
                break;
        
            case NodeType.EXEC:
                exec(node.params.content || `echo ${config.ENCFE}`);
                break;
        }
    });
};

// Función para manejar comandos
/*const commandite = (command: string, node: Node) => {
    let value: Variable|string|null|undefined = "";
    switch (command) {
        case "GET":
            value = memory.getVar(node.params.name);
            break;
        default:
            error(`Unknown command: ${command}`);
    }
    return value;
};*/

// Función para evaluar condiciones
/*const commanditeCond = (node: Condition): boolean | undefined => {
    let value: boolean | undefined = false;

    switch (node.cond) {
        case "==":
            value = node.firstValue === node.secondValue;
            break;
        case "!=":
            value = node.firstValue !== node.secondValue;
            break;
        case "<=":
            value = node.firstValue !== undefined && node.secondValue !== undefined ? node.firstValue <= node.secondValue : undefined;
            break;
        case ">=":
            value = node.firstValue !== undefined && node.secondValue !== undefined ? node.firstValue >= node.secondValue : undefined;
            break;
        case "<":
            value = node.firstValue !== undefined && node.secondValue !== undefined ? node.firstValue < node.secondValue : undefined;
            break;
        case ">":
            value = node.firstValue !== undefined && node.secondValue !== undefined ? node.firstValue > node.secondValue : undefined;
            break;
        default:
            error(`Unknown condition: ${node.cond}`);
    }

    return value;
};*/
app.listen(config.port, () => {
    console.log(config.port === 0o0 ? '' : `Project running on port http://localhost:${config.port}`);
});

const processHTML = (html?: string) => {
    const componentRegex = /<\{(\w+)\}>/g;

    return (html || ``)
        .replace(componentRegex, (_match, componentName) => {
            return memory.getComponent(componentName) || `<p>Component not founded</p>`;
        })
    ;
}