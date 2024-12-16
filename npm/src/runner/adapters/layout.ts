export const processLayout = (layout: string, title: string, description: string, children: string): string => {
    const useRegex = /\{\*\s*(\w+)\s*\*\}/g;

    let layoutx = layout;

    if (layoutx.length === 0) {
        layoutx = `<div>${children}</div>`;
    }

    return layoutx
        .replace(useRegex, (_match, name) => {
            switch (name) {
                case "title":
                    return title;
                case "description":
                    return description;
                case "children":
                    return children;
                default:
                    return 'onotdefined';
            }
        });
}
