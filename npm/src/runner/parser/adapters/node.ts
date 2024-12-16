import { Node } from "../types";

export const NodeAdapter = (node: Node) => {
    const newNode: Node = node;
    if (newNode.params.content) {
        newNode.params.content = newNode.params.content
            .replace('"', "")
            .replace(/"/g, "")
            .replace(/\n/g, "")
            .replace(/\r/g, "")
            .replace("%", " ");
    }
    return newNode;
};
