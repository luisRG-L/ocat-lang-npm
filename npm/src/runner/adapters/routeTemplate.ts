import { Route } from "../types";

export const processRouteTemplate = (
    html: string,
    routes: Route[]
): string => {
    return routes.map(({name, content}) => {
        return (html ?? `<div>{*name*}</div>`)
            .replace(/{\*name\*}/g, name)
            .replace(/{\*content\*}/g, content);
    }).join("") ?? '';
};