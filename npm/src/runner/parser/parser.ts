import { Node, NodeType, RestMode } from "./types";
import { Token, TokenType } from "../lexer";
import { CustomError, OSyntaxError, Warning } from "../../error";
import { NodeAdapter } from "./adapters";

let tokens: Token[];
let currentIndex: number = 0;

export const parse = (tokensK: Token[]): Node[] => {
    const nodes: Node[] = [];
    tokens = tokensK;
    let line = 1;
    currentIndex = 0;

    while (currentIndex < tokens.length) {
        let token = getToken();
        let node: Node = {
            type: NodeType.ERR,
            params: { cause: "Unknown token error" },
            base: token,
            line,
        };

        try {
            switch (token.type) {
                case TokenType.IO:
                    if (token.value === "print") {
                        nextToken();
                        token = getToken();
                        if (token.type !== TokenType.Shape) {
                            throw new OSyntaxError(
                                `Expected '(' after 'print', but got: ${token.value} (Type: ${token.type})`
                            );
                        }
                        node.type = NodeType.OUTPUT;
                        nextToken();
                        node.params = { content: collectString() };
                        nextToken();
                    }
                    break;

                case TokenType.IERQ:
                    node.type = NodeType.IMPORT;
                    nextToken();
                    token = getToken();
                    if (token.type !== TokenType.Value) {
                        throw new OSyntaxError(
                            `Expected value after 'import', but got: ${token.value} (Type: ${token.type})`
                        );
                    }
                    node.params = { name: sanitizeTokenValue(token.value) };
                    break;

                case TokenType.Component:
                    nextToken();
                    token = getToken();
                    if (token.type !== TokenType.Identifier) {
                        throw new OSyntaxError(
                            `Expected identifier after 'component', but got: ${token.value} (Type: ${token.type})`
                        );
                    }
                    const name = sanitizeTokenValue(token.value);
                    node.type = NodeType.CDECLARE;

                    nextToken();
                    token = getToken();
                    if (token.type !== TokenType.PageRequest) {
                        throw new OSyntaxError(
                            `Expected page request after 'component', but got: ${token.value} (Type: ${token.type})`
                        );
                    }
                    nextToken();
                    token = getToken();
                    const params = collectTag().join(" ");

                    node.params = { name, content: params };
                    break;

                case TokenType.PageRequest:
                    node.type = NodeType.SHOW;
                    nextToken();
                    const tags = collectTag();
                    const joinedTags = tags
                        //.map((tag) => tag.trim())
                        .join(" ")
                        .trim();

                    if (joinedTags.startsWith("%css-global%")) {
                        node.type = NodeType.STYLE;
                        node.params = {
                            content: joinedTags.replace("%css-global%", ""),
                        };
                        break;
                    }

                    nextToken();
                    if (!getToken() || getToken().value !== "as") {
                        throw new OSyntaxError(
                            `Expected 'as' after value, but got: ${
                                getToken() ? getToken().value : "\\eof"
                            } (Type: ${
                                getToken() ? getToken().type : TokenType.EOF
                            } at index ${currentIndex})`
                        );
                    }

                    nextToken();
                    node.params = {
                        content: joinedTags,
                        route: sanitizeTokenValue(getToken().value),
                    };
                    break;

                case TokenType.EOF:
                    return nodes.map(NodeAdapter);

                case TokenType.Comment:
                    skipComment();
                    node.type = NodeType.NONE;
                    break;

                case TokenType.Meta:
                    node.type = NodeType.META;
                    if (token.value === "title") {
                        node.params.type = "\\title";
                    } else {
                        nextToken();
                        token = getToken();
                        if (token.type !== TokenType.Value) {
                            throw new OSyntaxError(
                                `Expected value after 'meta', but got: ${token.value} (Type: ${token.type})`
                            );
                        }
                        node.params.type = sanitizeTokenValue(collectString());
                    }
                    nextToken();
                    token = getToken();
                    if (token.type !== TokenType.Value) {
                        throw new OSyntaxError(
                            `Expected value after 'meta', but got: ${token.value} (Type: ${token.type})`
                        );
                    }
                    node.params.content = sanitizeTokenValue(collectString());
                    break;

                case TokenType.Datatype:
                    const type = token.value;
                    nextToken();
                    token = getToken();
                    const vname = token.value;
                    nextToken();
                    token = getToken();
                    if (token.type !== TokenType.Assign) {
                        throw new OSyntaxError(
                            `Expected '=' after variable name, but got: ${token.value} (Type: ${token.type})`
                        );
                    }
                    nextToken();
                    token = getToken();
                    if (token.type !== TokenType.Value) {
                        throw new OSyntaxError(
                            `Expected value after '=', but got: ${token.value} (Type: ${token.type})`
                        );
                    }
                    node.type = NodeType.DECLARE;
                    node.params.name = vname;
                    if (type === "string") {
                        node.params.value = sanitizeTokenValue(collectString());
                    } else {
                        node.params.value = sanitizeTokenValue(token.value);
                    }
                    node.params.type = type;
                    break;

                case TokenType.ExportW:
                    node.type = NodeType.EXPORTW;
                    break;

                case TokenType.Conditional:
                    node.params.condition = {};
                    switch (token.value) {
                        case "if":
                            node.type = NodeType.IF;
                            nextToken();
                            token = getToken();
                            if (token.type !== TokenType.Shape) {
                                throw new OSyntaxError(
                                    `Expected '(' after 'if', but got: ${token.value} (Type: ${token.type})`
                                );
                            }
                            nextToken();
                            token = getToken();
                            const params = collectParam().join(" ");
                            nextToken();
                            token = getToken();

                            node.params.condition.cond = params;
                            node.params.condition.body = collectBlock();
                            break;
                    }
                    break;

                case TokenType.Function:
                    node.type = NodeType.Function;
                    nextToken();
                    token = getToken();
                    if (token.type !== TokenType.Identifier) {
                        throw new OSyntaxError(
                            `Expected identifier after 'func', but got: ${token.value} (Type: ${token.type})`
                        );
                    }
                    node.params.name = sanitizeTokenValue(token.value);
                    nextToken();
                    token = getToken();
                    if (token.type !== TokenType.Block) {
                        throw new OSyntaxError(
                            `Expected '{' after function name, but got: ${token.value} (Type: ${token.type})`
                        );
                    }
                    nextToken();
                    token = getToken();
                    const content = collectBlock();
                    node.params.content = content;
                    break;

                case TokenType.FCall:
                    node.type = NodeType.FCall;
                    nextToken();
                    token = getToken();
                    if (token.type !== TokenType.Identifier) {
                        throw new OSyntaxError(
                            `Expected identifier after 'call', but got: ${token.value} (Type: ${token.type})`
                        );
                    }
                    node.params.name = sanitizeTokenValue(token.value);

                    break;

                case TokenType.ORDER:
                    const orderName = token.value.replace("@", "");
                    if (orderName === "strict") {
                        node.type = NodeType.UseStrict;
                    } else {
                        node.type = NodeType.ORDER;
                        nextToken();
                        token = getToken();
                        node.params.name = orderName;
                        if (token.type !== TokenType.Shape) {
                            node.params.content = "true";
                            currentIndex--;
                            break;
                        }

                        nextToken();
                        token = getToken();
                        const params = token.value;
                        nextToken();
                        token = getToken();
                        node.params.content = params;
                    }
                    break;

                case TokenType.SCS:
                    node.type = NodeType.Create;
                    nextToken();
                    token = getToken();
                    if (token.type !== TokenType.Identifier) {
                        throw new OSyntaxError(
                            `Expected identifier after 'call', but got: ${token.value} (Type: ${token.type})`
                        );
                    }
                    const dtype = sanitizeTokenValue(token.value);
                    node.params.type = dtype;
                    nextToken();
                    token = getToken();
                    if (token.type !== TokenType.Value) {
                        throw new OSyntaxError(
                            `Expected value after 'call', but got: ${token.value} (Type: ${token.type})`
                        );
                    }
                    const dname = sanitizeTokenValue(collectString());
                    node.params.name = dname;
                    if (dtype === "file") {
                        nextToken();
                        token = getToken();
                        if (token.type !== TokenType.Value) {
                            throw new OSyntaxError(
                                `Expected value after 'call', but got: ${token.value} (Type: ${token.type})`
                            );
                        }
                        const content = sanitizeTokenValue(collectString());
                        node.params.content = content;
                    }
                    break;

                case TokenType.Layout:
                    node.type = NodeType.Layout;
                    nextToken();
                    token = getToken();
                    if (token.type !== TokenType.PageRequest) {
                        throw new OSyntaxError(
                            `Expected page request after 'layout', but got: ${token.value} (Type: ${token.type})`
                        );
                    }
                    nextToken();
                    const tag = collectTag().join(" ");
                    node.params = { content: tag };
                    break;

                case TokenType.Load:
                    node.type = NodeType.LOAD;
                    let _type = "";
                    switch (token.value) {
                        case "loadComponent":
                            _type = "component";
                            break;
                        case "loadLayout":
                            _type = "layout";
                            break;
                        case "loadTemplate":
                            _type = "layout";
                            break;
                    }
                    nextToken();
                    token = getToken();
                    if (token.type !== TokenType.Value) {
                        throw new OSyntaxError(
                            `Expected string after load, but got: ${token.value} (Type: ${token.type})`
                        );
                    }
                    const path = sanitizeTokenValue(collectString());
                    node.params = { route: path, type: _type };
                    break;

                default:
                    throw new OSyntaxError(
                        `Unexpected token: ${token.value} (Type: ${token.type})`
                    );
            }

            nextToken();
            nodes.push(NodeAdapter(node));
        } catch (e) {
            if (e instanceof Warning || e instanceof CustomError) {
                e.display(line);
            }
        }
    }

    return nodes;
};

const getToken = (): Token => {
    return tokens[currentIndex];
};

const nextToken = (): void => {
    currentIndex++;
};

const collectString = (): string => {
    let token = getToken();
    let str: string = "";

    while (token.type !== TokenType.Shape && !isStringEnd(token.value)) {
        str += sanitizeTokenValue(token.value) + " ";
        nextToken();
        token = getToken();
    }

    if (isStringEnd(token.value)) {
        str += sanitizeTokenValue(token.value);
    }
    return str.trim();
};

const collectBlock = (): string => {
    let token = getToken();
    let str: string = "";

    while (token.type !== TokenType.Block) {
        str += token.value + " ";
        nextToken();
        token = getToken();
    }

    str += token.value;
    return str.replace(/\{/g, "").replace(/\}/g, "").trim();
};

const collectParam = (): string[] => {
    let token = getToken();
    let param: string[] = [];

    while (token.type !== TokenType.Shape) {
        param.push(token.value);
        nextToken();
        token = getToken();
    }

    nextToken();
    token = getToken();
    param.push(token.value);
    return param;
};

const collectTag = (): string[] => {
    let token = getToken();
    const param: string[] = [];

    while (token.type !== TokenType.PageRequest) {
        param.push(token.value.trim());
        nextToken();
        token = getToken();
    }

    return param;
};

const isStringEnd = (value: string): boolean => {
    return value.endsWith('"') || value.endsWith("'") || value.endsWith("`");
};

const sanitizeTokenValue = (value: string): string => {
    return value
        .replace(/["'`]/g, "")
        .replace(/\n/g, "")
        .replace(/\r/g, "")
        .replace("%", " ");
};
function skipComment() {}

function collectObject(): string {
    let token = getToken();
    let str: string = "";
    let iteration = 1;

    while (iteration !== 0) {
        if (token.type === TokenType.Block) {
            if (token.value === "{") {
                iteration++;
            } else if (token.value === "}") {
                iteration--;
            }
        }
        str += token.value + " ";
        nextToken();
        token = getToken();
    }

    return str.trim();
}
