import { CustomError, ErrorType, Warning } from "../error";
import { Memory, Function, DCollection } from "../memory/";
import { print } from "../print/";
import { init, rund } from "../lang";

import { Node, NodeType } from "./parser";

import { getValue, readFile } from "./utils";
import { Route } from "./types";
import {
    process404,
    processCSS,
    processHTML,
    processLayout,
    processRoute,
    processRouteTemplate,
} from "./adapters";

import express from "express";
import path from "path";
import fs from "fs";
import { exec } from "child_process";

import {
    config,
    code404,
    codeRouteTemplate,
    preJs,
    preStyles,
    globalStyles,
    defhead,
} from "./constants";
import { View, viewAdapt, viewAdapter } from "./adapters/view";

const memory: Memory = new Memory();

const app = express();

export const save = () => {
    const properties = config.properties;

    if (!properties) {
        console.log("No properties provided");
        return;
    }

    properties.provided.forEach((key: string) => {
        memory.addProperty(key);
    });

    Object.entries(properties.defined).forEach(([name, value]) => {
        memory.addProperty(name);
        memory.setOrder(name, value as string);
    });

    Object.entries(config.collections).forEach(([name, value]) => {
        const folder = path.join("./collections", value as string);
        if (fs.existsSync(folder)) {
            const collectionItems: DCollection[] = [];
            const items = fs.readdirSync(folder, { withFileTypes: true });
            const files = items.filter((item) => item.isFile());
            files.forEach((file) => {
                const name = file.name;
                const params: { [key: string]: string } = {};
                const content = fs
                    .readFileSync(path.join(folder, name), "utf8")
                    .replace(
                        /---\s+(.*?)\s+---/gs,
                        (_match: string, paramContent: string) => {
                            const paramMatch = /(.*?)="(.*?)"/gs;
                            const matchs = paramContent.match(paramMatch);
                            matchs?.forEach(([match, key, valuex]) => {
                                params[key] = valuex;
                            });
                            return "";
                        }
                    );
                collectionItems.push({
                    content,
                    params,
                    title: name,
                });
            });
            memory.declareCollection(name, collectionItems);
        }
    });
};

export const run = (nodes: Node[]): Memory => {
    save();
    const routes: Route[] = [];
    const views: View[] = [];
    let index = 0;
    let styles = preStyles + globalStyles;
    let head = defhead;
    let lastConditionValue: boolean = false;
    let title: string = "",
        description: string = "",
        layout: string = "";

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
                        memory,
                        processLayout(
                            layout,
                            title,
                            description,
                            node.params.content ?? ""
                        )
                    );
                    const processedContent = `
    <head>${head}</head>
    <body>${processedHTMLContent}</body>
    `;
                    routes.push({ name: route, content: processedContent });
                    break;

                case NodeType.EXPORTW:
                    memory.setOrder("export", "true");
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
                        processHTML(memory, node.params.content ?? "")
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
                    layout = processHTML(memory, tag ?? "");
                    break;

                case NodeType.LOAD:
                    const _type = node.params.type ?? "";
                    const _route = node.params.route ?? "";
                    const pathName = _route.split("/").pop();
                    const readed =
                        readFile(_route + `/${pathName}.component.html`) ?? "";
                    const cssReaded =
                        readFile(_route + `/${pathName}.component.css`) ?? "";
                    const name = (readed.match(/<title>\w+<\/title>/g) ?? [
                        "udef",
                    ])[0]
                        .replace("<title>", "")
                        .replace("</title>", "");
                    if (_type === "component" || _type === "template") {
                        const prcontent = readed
                            .split(/\n/g)
                            .splice(1)
                            .join("\n");
                        const joinedContent =
                            prcontent +
                            `<style>${processCSS(cssReaded, name)}</style>`;
                        if (_type === "component") {
                            memory.declareComponent(name, joinedContent);
                        } else {
                            memory.declareTemplate(name, joinedContent);
                        }
                    } else if (_type === "layout") {
                        layout = processHTML(memory, readed);
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
    if (
        routes.length !== 0 ||
        config.views ||
        memory.getOrder("export") === "true" ||
        memory.getOrder("web")
    ) {
        if (config.views) {
            const viewsFolder = "./views/";
            if (!fs.existsSync(viewsFolder)) {
                fs.mkdirSync(viewsFolder);
            }
            const items = fs.readdirSync(viewsFolder, { withFileTypes: true });
            const files = items.filter((item) => item.isFile());
            const dirs = items.filter((item) => item.isDirectory());

            files.forEach((file) => {
                if (file.name.endsWith(".html")) {
                    const content = fs.readFileSync(
                        path.join(viewsFolder, file.name),
                        "utf-8"
                    );
                    views.push(viewAdapter(file.name, content));
                }
            });

            dirs.forEach((dir) => {
                const dirPath = path.join(viewsFolder, dir.name);
                const dirItems = fs.readdirSync(dirPath, {
                    withFileTypes: true,
                });
                const files = dirItems.filter((item) => item.isFile());
                files.forEach((file) => {
                    if (file.name.endsWith(".html")) {
                        const name = path.join(dirPath, file.name);
                        const _name = `${dir.name}/${file.name}`;
                        const content = fs.readFileSync(name, "utf-8");
                        const view = viewAdapter(_name, content);
                        views.push(view);
                    }
                });
            });

            views.forEach((view) => {
                app.get(view.name, (req, res) => {
                    if (view.useKey) {
                        res.send(
                            viewAdapt(view, memory, req.params.key ?? null)
                        );
                    } else {
                        res.send(viewAdapt(view, memory));
                    }
                });
            });
        }
        const routeTemplate = processRouteTemplate(
            codeRouteTemplate,
            routes,
            views
        );
        routes.forEach((route) => {
            app.get(route.name, (req, res) => {
                res.send(
                    processRoute(
                        memory,
                        preJs,
                        route.content,
                        route.name,
                        routeTemplate,
                        styles
                    )
                );
            });
        });
        app.all("*", (req, res) => {
            res.status(404).send(process404(code404, { routeTemplate }));
        });
        if (memory.getOrder("export") === "true") {
            if (fs.existsSync("./out")) fs.rmSync("./out", { recursive: true });
            fs.mkdirSync("./out");
            fs.mkdirSync("./out/css");
            fs.writeFileSync("./out/css/style.css", styles);

            routes.forEach((route) => {
                const routePath =
                    route.name === "/"
                        ? "./out/index.html"
                        : `./out/${route.name.replace(/^\//, "")}/index.html`;
                const dir = path.dirname(routePath);
                fs.mkdirSync(dir, { recursive: true });
                const cssPath =
                    route.name === "/"
                        ? "./css/style.css"
                        : "../".repeat(route.name.split("/").length - 1) +
                          "css/style.css";
                const contentWithCSS = `<link href="${cssPath}" rel="stylesheet" />${route.content}`;

                fs.writeFileSync(routePath, contentWithCSS);
            });
        }
        try {
            app.listen(config.port, () => {
                console.log(
                    `Server running at http://localhost:${config.port}/`
                );
                console.log(`Quit the server with (CTRL or CMD) + C`);
            });
        } catch (e) {
            console.log("The port is already in use");
        }
    }
    return memory;
};

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
