import * as fs from "fs";
import path from "path";

export const processPath = (wppath: string, uglify: boolean = false): string => {
    const rules = readFileWP(path.join(__dirname, "../../../../../config/path.json"), uglify) ?? readFileWP('./.ocat/path.json', uglify);
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

export const readFile = (_path: string, uglify: boolean = false): string | null => {
    try {
        const path = processPath(_path, uglify);
        const data = fs.readFileSync(path, "utf8");
        if (uglify) {
            return data.replace(/\s+/g, "");
        }
        return data;
    } catch (e) {
        return null;
    }
};

export const readFileWP = (path: string, uglify: boolean = false): string | null => {
    try {
        const data = fs.readFileSync(path, "utf8");
        if (uglify) {
            return data.replace(/\s+/g, "");
        }
        return data;
    } catch (e) {
        return null;
    }
};