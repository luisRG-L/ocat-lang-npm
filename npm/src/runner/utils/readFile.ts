import * as fs from "fs";
import { processPath } from "../adapters/path";

export const readFile = (_path: string, uglify: boolean = false): string | null => {
    try {
        const path = processPath(_path);
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