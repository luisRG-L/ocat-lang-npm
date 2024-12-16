import { BasicConfig, processBasic } from "./basic";

export const process404 = (html: string, config: BasicConfig): string => {
    return processBasic(html ?? `<h1>404 Not Found</h1>`, config);
    ;
};