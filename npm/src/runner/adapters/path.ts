import path from "path";
import { readFileWP } from "../utils/readFile";

export const processPath = (wppath: string): string => {
    const rules = readFileWP(path.join(__dirname, "../../../../../config/path.json")) ?? readFileWP('./.ocat/ocat.json');
    if (rules) {
        const json = JSON.parse(rules);
        let ppath = wppath;
        for (const key in json) {
            if (json[key].includes("${projectRoot}")) {
                json[key] = json[key].replace("${projectRoot}", process.cwd());
            }
            if (json[key].includes("${projectName}")) {
                json[key] = json[key].replace("${projectName}", process.cwd().split("/").pop());
            }
            ppath = ppath.replace(key, json[key]);
        }
        return ppath;
    }
    return wppath;
};