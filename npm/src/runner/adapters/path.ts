import path from "path";
import { readFileWP } from "../utils/readFile";

interface PathRules {
    [key: string]: string;
}

const loadPathRules = (): PathRules | null => {
    const configPath = path.join(__dirname, "../../../../../config/path.json");
    const fallbackPath = './.ocat/ocat.json';
    const rules = readFileWP(configPath) ?? readFileWP(fallbackPath);
    return rules ? JSON.parse(rules) : null;
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

export const processPath = (wppath: string): string => {
    const rules = loadPathRules();
    return rules ? applyPathRules(wppath, rules) : wppath;
};