const replaceRoutesPlaceholder = (template: string, routes: string): string => {
    return template.replace(/{\*routes\*}/g, routes);
};

export const processPre = (pre: string, routes: string): string => {
    const template = pre ?? ``;
    return replaceRoutesPlaceholder(template, routes);
};