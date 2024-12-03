import { Node, NodeType, RestMode } from "./parser/types";
import { CustomError, ErrorType, Warning } from "../error";
import { Memory, Function } from "../memory/";
import { print } from "../print/";
import express from "express";
import path from "path";
import { init, rund } from "../lang";
import { exec } from "child_process";
import { getValue, readFile } from "./utils";
import { Route } from "./types/Route";
import * as fs from "fs";

const configFile = '../../json/config.json';
const cssFile = '../../assets/style.css';
const jsFile = '../../assets/ocat.js';

const autoCssFile = './css/style.css';
const autoJsFile = './assets/ocat.js';

const configPath = path.resolve(__dirname, configFile);
const cssPath = path.resolve(__dirname, cssFile);
const jsPath = path.resolve(__dirname, jsFile);

const data = readFile(configPath);
const preStyles = (readFile(autoCssFile, true) ?? readFile(cssPath, true)) ?? '';
const preJs = (readFile(autoJsFile) ?? readFile(jsPath)) ?? '';

const config = JSON.parse(data ?? '{"port": 8080}');

const memory: Memory = new Memory();

const app = express();

export const run = (nodes: Node[]): Memory => {
    let routes: Route[] = [];
    let index = 0;
    let styles = preStyles;
    let head =
        '<meta charset="UTF-8" /><meta name="Generator" content="Orange Cat" />';
    let lastConditionValue: boolean = false;
    let title: string = '', description: string = '', layout: string = '';

    nodes.forEach((node) => {
        const display = (err: any) => {
            if (err instanceof CustomError) {
                err.display(node.line);
            } else if (err instanceof Warning) {
                err.display(node.line);
            }
        };
        try {
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
                    throw new CustomError(
                        node.params.cause ?? config.DERR,
                        ErrorType.RuntimeError
                    );
                    break;

                case NodeType.DECLARE:
                    try {
                        memory.declareVar(
                            node.params.name,
                            node.params.value,
                            node.params.type
                        );
                    } catch (e) {
                        display(e);
                    }
                    break;

                case NodeType.IF:
                    const condition = node.params.condition;
                    const cond = condition?.cond;
                    const body = condition?.body;
                    if (cond && body) {
                        try {
                            lastConditionValue = commanditeCond(cond);
                            if (lastConditionValue) {
                                rund(false, false, body);
                            }
                        } catch (e) {
                            display(e);
                        }
                    }
                    break;

                case NodeType.SHOW:
                    const route = "/" + (node.params.route ?? `404/${++index}`);
                    const processedHTMLContent = processHTML(
                        processLayout(
                            layout,
                            title, 
                            description, 
                            node.params.content ?? ''
                        )
                    );
                    const processedContent = `
    <head>${head}</head>
    <body>${processedHTMLContent}</body>
    `;
                    routes.push({ name: route, content: processedContent });
                    break;

                case NodeType.EXPORTW:
                    if (fs.existsSync("./out"))
                        fs.rmSync("./out", { recursive: true });
                    fs.mkdirSync("./out");
                    fs.mkdirSync("./out/css");
                    fs.writeFileSync("./out/css/style.css", styles);

                    routes.forEach((route) => {
                        const routePath =
                            route.name === "/"
                                ? "./out/index.html"
                                : `./out/${route.name.replace(
                                      /^\//,
                                      ""
                                  )}/index.html`;
                        const dir = path.dirname(routePath);
                        fs.mkdirSync(dir, { recursive: true });
                        const cssPath =
                            route.name === "/"
                                ? "./css/style.css"
                                : "../".repeat(
                                      route.name.split("/").length - 1
                                  ) + "css/style.css";
                        const contentWithCSS = `<link href="${cssPath}" rel="stylesheet" />${route.content}`;

                        fs.writeFileSync(routePath, contentWithCSS);
                    });
                    break;

                case NodeType.STYLE:
                    styles +=
                        node.params.content || "* { box-sizing: border-box; }";
                    break;

                case NodeType.IMPORT:
                    const mem: Memory = init(
                        false,
                        false,
                        "./" + node.params.name || "./lib/main.ocat"
                    );
                    memory.copyFrom(mem);
                    break;

                case NodeType.UseStrict:
                    memory.setStrict();
                    break;

                case NodeType.ORDER:
                    memory.setOrder(node.params.name, node.params.content);
                    break;

                case NodeType.CDECLARE:
                    memory.declareComponent(
                        node.params.name,
                        processHTML(node.params.content)
                    );
                    break;

                case NodeType.META:
                    const { type, content } = node.params;
                    if (!(type && content)) {
                        break;
                    }
                    if (type.startsWith("\\")) {
                        switch (type.replace(/\\/g, "")) {
                            case "title":
                                head += `<title>${content}</title>`;
                                title = content;
                                break;
                        }
                    } else {
                        if (type === "description") {
                            description = content;
                        }
                        head += `<meta name="${type}" content="${content}" />`;
                    }
                    break;

                case NodeType.EXEC:
                    exec(node.params.content || `echo ${config.ENCFE}`);
                    break;

                case NodeType.Function:
                    memory.declareFunction(
                        node.params.name,
                        node.params.content
                    );
                    break;

                case NodeType.FCall:
                    const func: Function = memory.getFunction(
                        node.params.name
                    ) ?? { name: node.params.name ?? "", content: "" };
                    rund(false, false, func.content);
                    break;

                case NodeType.Create:
                    const dtype = node.params.type;
                    const dname = node.params.name;
                    const contentx = node.params.content;
                    if (dtype === "file") {
                        fs.writeFileSync(
                            dname ?? ".cats.ocat",
                            contentx ?? "p"
                        );
                    } else if (dtype === "folder" || dtype === "dir") {
                        fs.mkdirSync(dname ?? "./.ocat");
                    }
                    break;

                case NodeType.Layout:
                    const tag = node.params.content;
                    layout = processHTML(tag);
                    break;
            
                case NodeType.LOAD:
                    const _type = node.params.type ?? '';
                    const _route = node.params.route ?? '';
                    const pathName = _route.split('/').pop();
                    const readed = readFile(_route + `/${pathName}.component.html`) ?? '';
                    const cssReaded = readFile(_route + `/${pathName}.component.css`) ?? '';
                    const name = (readed.match(/<title>\w+<\/title>/g) ?? ['udef'])[0].replace('<title>', '').replace('</title>', '');
                    if (_type === "component") {
                        const prcontent = readed.split(/\n/g).splice(1).join('\n');
                        const joinedContent = prcontent + `<style>${processCSS(cssReaded, name)}</style>`;
                        memory.declareComponent(name, joinedContent);
                    } else if (_type === "layout") {
                        layout = processHTML(readed);
                    }
                    break;
            }
        } catch (e) {
            if (e instanceof Warning || e instanceof CustomError) {
                e.display(node.line);
            } else {
                console.log("INTERNAL ERROR");
            }
        }
    });
    if (routes.length !== 0) {
        routes.forEach((route) => {
            app.get(route.name, (req, res) => {
                res.send(processRoute(route.content, route.name, routes, styles));
            });
        });
        try {
            app.listen(config.port, () => {
                console.log(`Server running at http://localhost:${config.port}/`);
                console.log(`Quit the server with (CTRL or CMD) + C`);
            });
        } catch (e) {
            console.log("The port is already in use");
        }
    }
    return memory;
};

const processRoute = (content: string, route: string, routes: Route[], styles: string): string => {
    const DEVBAR = `<div class="--ocat-dev-var-tool"><oc-c>You are using the development mode</oc-c></div>`
    const useDev = memory.getOrder("mode") || memory.getOrder("dev");
    return `<style>${styles}</style><script type="module">${preJs}</script>${content}${useDev ? DEVBAR : ''}`
}

const commanditeCond = (condition: string): boolean => {
    const args_ = condition.split("\\s+");
    const args = args_.map((arg) => arg.trim());
    const firstValue = getValue(args[0], memory);
    const operator = args[1];
    const secondValue = getValue(args[2], memory);
    if (
        operator.match(/\b(<>|<=|>=|<|>)\b/) &&
        (firstValue.type !== "int" || secondValue.type !== "int")
    ) {
        const message = `Cannot compare ${firstValue.type} and ${secondValue.type} with a number operator`;
        if (memory.isStrict) {
            throw new CustomError(message, ErrorType.ExecutionError);
        } else {
            throw new Warning(message);
        }
    }
    switch (operator) {
        case "=":
            return firstValue.value === secondValue.value;
            break;

        case "!=":
            return firstValue.value !== secondValue.value;
            break;

        case "<>":
            return Number(firstValue.value) !== Number(secondValue.value);
            break;

        case "<=":
            return Number(firstValue.value) <= Number(secondValue.value);
            break;

        case ">=":
            return Number(firstValue.value) >= Number(secondValue.value);
            break;

        case "<":
            return Number(firstValue.value) < Number(secondValue.value);
            break;

        case ">":
            return Number(firstValue.value) > Number(secondValue.value);
            break;

        default:
            const message = `Unknown condition: ${operator}`;
            if (memory.isStrict) {
                throw new CustomError(message, ErrorType.ExecutionError);
            } else {
                throw new Warning(message);
            }
            break;
    }
};

const processHTML = (html?: string): string => {
    const componentRegex = /<\{\s*(\w+)([^}]*)\s*\}>/g;
    const innerRegex = /\{\{\s*(\w+)([^}]*)\s*\}\}/g;
    return (html ?? ``)
        .replace(
            componentRegex,
            (_match, componentName) =>
                `<div class="oc-component-${componentName}">${memory.getComponent(componentName) ?? `<p>${config.CNFE}</p>`}</div>`
        )
        .replace(
            innerRegex,
            (_match, inner) =>
                (
                    memory.getVar(inner) ?? { value: "onotdefined" }
                ).value.toString() ?? `onotdefined`
        )
        .replace(/undefined/g, '')
        ;
};

const processLayout = (layout: string, title: string, description: string, children: string): string => {
    const useRegex = /\{\*\s*(\w+)\s*\*\}/g;

    let layoutx = layout;

    if (layoutx.length === 0) {
        layoutx = `<div>${children}</div>`;
    }

    return layoutx
        .replace(useRegex, (_match, name) => {
            switch (name) {
                case "title":
                    return title;
                case "description":
                    return description;
                case "children":
                    return children;
                default:
                    return 'onotdefined';
            }
        });
}

const processCSS = (css: string, cname: string) => {
    return css.replace(/V  local/g, `.oc-component-${cname} `);
};
