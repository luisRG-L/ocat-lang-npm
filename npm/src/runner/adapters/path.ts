import path from "path";
import { readFileWP } from "../utils/readFile";
import { OcatConfig } from "../types";

interface PathRules {
    [key: string]: string;
}

const loadPathRules = (config: OcatConfig): PathRules | null => {
    return config.path ?? null;
};

const replacePlaceholders = (value: string): string => {
    const projectRoot = process.cwd();
    const projectName = projectRoot.split("/").pop() || "";
    return value
        .replace("${projectRoot}", projectRoot)
        .replace("${projectName}", projectName);
};

const applyPathRules = (wppath: string, rules: PathRules): string => {
    let ppath = wppath;
    for (const key in rules) {
        const replacedValue = replacePlaceholders(rules[key]);
        ppath = ppath.replace(key, replacedValue);
    }
    return ppath;
};

export const processPath = (wppath: string, config: OcatConfig): string => {
    const rules = loadPathRules(config);
    return rules ? applyPathRules(wppath, rules) : wppath;
};
