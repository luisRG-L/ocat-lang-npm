export const processPre = (pre: string, routes: string): string => {
    return (pre ?? ``)
        .replace(/{\*routes\*}/g, routes);
        ;
};