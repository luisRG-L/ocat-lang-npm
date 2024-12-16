export const processCSS = (css: string, cname: string) => {
    return css.replace(/local/g, `.oc-component-${cname} `);
};