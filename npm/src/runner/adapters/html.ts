import { readFileSync } from "fs";
import { Memory } from "../../memory";
import { processBasicWC } from "./basic";
import path from "path";

const validateInputs = (memory: Memory, html: string): void => {
    if (!memory || typeof memory !== "object") {
        throw new Error("Invalid memory object provided.");
    }
    if (typeof html !== "string") {
        throw new Error("Invalid HTML input. Expected a string.");
    }
};

const replaceComponentTags = (html: string, memory: Memory): string => {
    const componentRegex = /<\{\s*(\w+)([^}]*)\s*\}>/g;
    return html.replace(
        componentRegex,
        (_match, componentName) =>
            `<div class="oc-component-${componentName}">${
                memory.getComponent(componentName) ??
                `<p>Component not found</p>`
            }</div>`
    );
};

const replaceInnerTags = (html: string, memory: Memory): string => {
    const innerRegex = /\{\{\s*(\w+)([^}]*)\s*\}\}/g;
    return html.replace(innerRegex, (_match, inner) =>
        (memory.getVar(inner)?.value ?? "onotdefined").toString()
    );
};

const replaceOrderTags = (html: string, memory: Memory): string => {
    const ordersRegex = /use\((\w+)\)/g;
    return html.replace(ordersRegex, (_match, orderName) => {
        if (!memory.getProperties.includes(orderName)) {
            return `This property is not defined for using.`;
        }
        return memory.getOrder(orderName) ?? `${orderName} not found`;
    });
};

const replaceTemplateTags = (html: string, memory: Memory): string => {
    const useTemplateRegex = /useTemplate\s*\(\s*([^,]+?)\s*,\s*([^,]+?)\s*\)/g;
    const collectionParamRegex = /\{\*\s*(\w+)\s*\*\}/g;

    return html.replace(useTemplateRegex, (_match, collectionName, value) => {
        const template = readFileSync(path.join("./templates", value), "utf-8");
        if (!template) {
            return `Template ${value} not found`;
        }
        const collection = memory.getCollection(collectionName);
        return (
            collection
                ?.map((item) => {
                    return template.replace(
                        collectionParamRegex,
                        (_match, param) => {
                            if (param === "children" || param === "content") {
                                return item.content;
                            } else {
                                return item.params[param];
                            }
                        }
                    );
                })
                .join("") ?? ""
        );
    });
};

export const processHTML = (memory: Memory, html: string): string => {
    validateInputs(memory, html);

    let processedHtml = html;

    const proccessers = [
        replaceTemplateTags,
        replaceComponentTags,
        replaceInnerTags,
        replaceOrderTags,
    ];
    proccessers.forEach((p) => {
        processedHtml = p(processedHtml, memory);
    });
    processedHtml = processBasicWC(processedHtml);
    processedHtml = processedHtml.replace(/undefined/g, "");

    return processedHtml;
};
