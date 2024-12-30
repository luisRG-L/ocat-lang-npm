import { Route } from "../types";
import { View } from "./view";

export const processRouteTemplate = (
    html: string,
    routes: Route[],
    views: View[]
): string => {
    return `
<h3>From Routes: </h3>
${routes
    .map(({ name, content }) =>
        (html ?? `<div>{*name*}</div>`)
            .replace(/{\*name\*}/g, name)
            .replace(/{\*content\*}/g, content)
    )
    .join("")}
<h3>From Views: </h3>
${views
    .map(({ name, content }) =>
        (html ?? `<div>{*name*}</div>`)
            .replace(/{\*name\*}/g, name)
            .replace(/{\*content\*}/g, content)
    )
    .join("")}`;
};
