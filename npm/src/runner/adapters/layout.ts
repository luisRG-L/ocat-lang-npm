const DEFAULT_LAYOUT = '<div>{* children *}</div>';
const PLACEHOLDER_REGEX = /\{\*\s*(\w+)\s*\*\}/g;

const replacePlaceholder = (layout: string, name: string, value: string): string => {
    return layout.replace(new RegExp(`\\{\\*\\s*${name}\\s*\\*\\}`, 'g'), value);
};

const getDefaultLayout = (layout: string, children: string): string => {
    return layout.length === 0 ? DEFAULT_LAYOUT.replace('{* children *}', children) : layout;
};

export const processLayout = (layout: string, title: string, description: string, children: string): string => {
    let processedLayout = getDefaultLayout(layout, children);

    const replacements: { [key: string]: string } = { title, description, children };

    for (const [name, value] of Object.entries(replacements)) {
        processedLayout = replacePlaceholder(processedLayout, name, value);
    }

    return processedLayout.replace(PLACEHOLDER_REGEX, 'onotdefined');
};
