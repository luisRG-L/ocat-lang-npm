import { defhead, generator } from "../constants";

export const processBasic = (html: string, config: BasicConfig): string => 
    processBasicWC(html).replace(/{\*routes\*}/g, config.routeTemplate);

export const processBasicWC = (html: string, ): string => 
    html.replace(/\{\s*(\w+)([^}]*)\s*\}/g, (_match, getter) => {
        switch (getter) {
            case 'generator': return generator;
            case 'head': return defhead;
            default: return '';
        }
    });

export interface BasicConfig {
    routeTemplate: string;
}
