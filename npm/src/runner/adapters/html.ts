import { Memory } from "../../memory";
import { processBasicWC } from "./basic";

export const processHTML = (memory: Memory, html: string): string => {
    if (!memory || typeof memory !== 'object') {
        throw new Error("Invalid memory object provided.");
    }
    if (typeof html !== 'string') {
        throw new Error("Invalid HTML input. Expected a string.");
    }

    const componentRegex = /<\{\s*(\w+)([^}]*)\s*\}>/g;
    const innerRegex = /\{\{\s*(\w+)([^}]*)\s*\}\}/g;
    const ordersRegex = /use\((\w+)\)/g;
    const useTemplateRegex = /useTemplate \((\w+), (\w+)\)/g;
    const collectionParamRegex = /\{\*(\w+)\*\}/g;

    return processBasicWC(html)
        .replace(
            componentRegex,
            (_match, componentName) =>
                `<div class="oc-component-${componentName}">${
                    memory.getComponent(componentName) ?? `<p>Component not found</p>`
                }</div>`
        )
        .replace(
            innerRegex,
            (_match, inner) =>
                (memory.getVar(inner)?.value ?? "onotdefined").toString()
        )
        .replace(/undefined/g, "")
        .replace(
            ordersRegex,
            (_match, orderName) => {
                if (!memory.getProperties.includes(orderName)) {
                    return `This property is not defined for using.`;
                }
                return memory.getOrder(orderName) ?? `${orderName} not found`;
            }
        )
        .replace(
            useTemplateRegex,
            (_match, collectionName, value) => {
                const template = memory.getTemplate(value);
                if (!template) {
                    return `Template ${value} not found`;
                }
                return template.replace(
                    collectionParamRegex,
                    (_match, param) => {
                        const collection = memory.getCollection(collectionName);
                        if (!collection) {
                            return `Collection ${collectionName} not found`;
                        }
                        return collection[param] ?? `Collection ${collectionName} not found`;
                    }
                );
            }
        );
};
