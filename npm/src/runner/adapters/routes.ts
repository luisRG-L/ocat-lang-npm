import { Memory } from "../../memory";
import { Route } from "../types";

const createLabel = (forAttr: string, text: string): string => `
    <div class="row">
        <label for="${forAttr}">${text}</label>
    </div>
`;

const createDevBarButton = (): string => `
    <button 
        onclick="document.getElementById('--ocat-dev-var-tool-container').hidden = !document.getElementById('--ocat-dev-var-tool-container').hidden"
        id="--ocat-dev-var-tool-button"
    >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: rgba(100, 100, 100, 100);transform: ;msFilter:;">
            <path d="M17 14a5 5 0 0 0 2.71-.81L20 13a3.16 3.16 0 0 0 .45-.37l.21-.2a4.48 4.48 0 0 0 .48-.58l.06-.08a4.28 4.28 0 0 0 .41-.76 1.57 1.57 0 0 0 .09-.23 4.21 4.21 0 0 0 .2-.63l.06-.25A5.5 5.5 0 0 0 22 9V2l-3 3h-4l-3-3v7a5 5 0 0 0 5 5zm2-7a1 1 0 1 1-1 1 1 1 0 0 1 1-1zm-4 0a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"></path>
            <path d="M11 22v-5H8v5H5V11.9a3.49 3.49 0 0 1-2.48-1.64A3.59 3.59 0 0 1 2 8.5 3.65 3.65 0 0 1 6 5a1.89 1.89 0 0 0 2-2 1 1 0 0 1 1-1 1 1 0 0 1 1 1 3.89 3.89 0 0 1-4 4C4.19 7 4 8.16 4 8.51S4.18 10 6 10h5.09A6 6 0 0 0 19 14.65V22h-3v-5h-2v5z"></path>
        </svg>
    </button>
`;

const createDevBarContent = (route: string, routes: string): string => `
    <div hidden id="--ocat-dev-var-tool-container">
        <oc-c class="occ">
            <div class="occ">
                ${createLabel("route", `Route: ${route}`)}
            </div>
        </oc-c>
        <oc-c class="occ">
            <div class="occ">
                ${createLabel("routes", "Routes:")}
                ${routes}
            </div>
        </oc-c>
    </div>
`;

export const devBar = (memory: Memory, route: string, routes: string): string => `
    <div class="--ocat-dev-var-tool">
        <div class="cc">
            ${createDevBarContent(route, routes)}
        </div>
        <oc-c>
            ${createDevBarButton()}
        </oc-c>
    </div>
`;

export const processRoute = (memory: Memory, preJs: string, content: string, route: string, routes: string, styles: string): string => {
    const useDev = memory.getOrder("mode") || memory.getOrder("dev");
    const devBarContent = useDev ? devBar(memory, route, routes) : '';
    return `
        <style>${styles}</style>
        <script type="module">${preJs}</script>
        ${content}
        ${devBarContent}
    `;
}