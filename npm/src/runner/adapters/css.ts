import { Memory } from "../../memory";

export const processCSS = (css: string, cname: string, memory: Memory) => {
    return css
        .replace(/local/g, `.oc-component-${cname} `)
        .replace(/prop\((\w+)\)/g, (_match, propname) => {
            return memory.getActuallyTheme().properties[propname];
        });
};
