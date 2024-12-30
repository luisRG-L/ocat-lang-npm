import { readFile } from "../utils";
import { autoConfigFile, autoCssFile, autoJsFile, autoFile404, autoRouteTemplate, autoGlobalCss } from "./auto";
import { configPath, cssPath, jsPath, path404, pathRouteTemplate } from "./paths";

// Read files
export const data = (readFile(autoConfigFile) ?? readFile(configPath)) ?? '{"port": 8080}';
export const preStyles = (readFile(autoCssFile) ?? readFile(cssPath)) ?? '';
export const globalStyles = readFile(autoGlobalCss) ?? ''
export const preJs = (readFile(autoJsFile) ?? readFile(jsPath)) ?? '';
export const code404 = (readFile(autoFile404) ?? readFile(path404)) ?? '';
export const codeRouteTemplate = (readFile(autoRouteTemplate) ?? readFile(pathRouteTemplate)) ?? '';

export const config = JSON.parse(data);
