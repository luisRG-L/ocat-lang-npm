import { defhead, generator } from "../constants";

export const processBasic = (html: string, config: BasicConfig): string => {
    return processBasicWC(html)
        .replace(/{\*routes\*}/g, config.routeTemplate)
    ;
};

export function processBasicWC (html: string) {
    const getterRegExp = /\{\s*(\w+)([^}]*)\s*\}/g;

    return html
        .replace(getterRegExp, (_match, getter) => {
            let result = '';
            switch (getter) {
                case 'generator':
                    result = generator;
                    break;

                case 'head':
                    result = defhead;
                    break;
            }
            return result;
        })
}

export interface BasicConfig {
    routeTemplate: string;
}