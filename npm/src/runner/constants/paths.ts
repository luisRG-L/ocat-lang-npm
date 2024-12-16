import path from "path";
import { configFile, cssFile, file404, jsFile, routeTemplate } from "./globals";

// Paths
export const configPath = path.resolve(__dirname, configFile);
export const cssPath = path.resolve(__dirname, cssFile);
export const jsPath = path.resolve(__dirname, jsFile);
export const path404 = path.resolve(__dirname, file404);
export const pathRouteTemplate = path.resolve(__dirname, routeTemplate);
