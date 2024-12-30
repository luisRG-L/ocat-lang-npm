import { Memory } from "../../memory";
import { processHTML } from "./html";

export interface View {
    name: string;
    content: string;
    useKey: boolean;
    useAll: boolean;
}

export function processContent(
    content: string,
    memory: Memory,
    key?: string
): string {
    const keyRegex = /{\@key\s+(.*?)}(.*?)\{\@endkey\}/gs;

    return processHTML(
        memory,
        content.replace(keyRegex, (match, expectedKey, result) => {
            return key === expectedKey ? result : "";
        })
    );
}

export function viewAdapter(name: string, content: string): View {
    return {
        name: `/${name
            .replace(/\.html$/, "")
            .replace(/index$/, "")
            .replace(/\.all$/, "*")
            .replace(/\.key$/, ":key")}`,
        content,
        useKey: name.endsWith(".key.html"),
        useAll: name.endsWith(".all.html"),
    };
}

export function viewAdapt(view: View, mem: Memory, key?: string): string {
    const content = processContent(view.content, mem, key);

    if (view.useKey) {
        if (!key) {
            throw new Error("Key is required for key view");
        }
        return content.replace(/{\*key\*}/g, key);
    }

    return content;
}
