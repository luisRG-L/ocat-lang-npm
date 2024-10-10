import { Node, NodeType, Token, TokenType } from './types/index.js';
import { error } from '../error/error.js';
import { NodeAdapter } from '../adapters/adapters.js';

let tokens: Token[];
let currentIndex: number = 0;

export const parse = (tokensK: Token[]): Node[] => {
    const nodes: Node[] = [];
    tokens = tokensK;
    currentIndex = 0; // Reiniciamos el índice por si se llama varias veces a parse

    while (currentIndex < tokens.length) {
        let token: Token = getToken();
        const node: Node = {
            type: NodeType.ERR,
            params: {
                cause: 'Unknown token error'
            },
            base: token
        };

        if (token.type === TokenType.IO && token.value === 'print') {
            nextToken();
            token = getToken();

            if (token.type !== TokenType.Shape) {
                error(`Expected '(' after 'print', but got: ${token.value} (Type: ${token.type})`);
            }

            nextToken();
            token = getToken();
            node.type = NodeType.OUTPUT;
            if (token.value.startsWith('"') || token.value.startsWith("'")) {
                node.params = {
                    content: collectString()
                }
            } else if(token.type === TokenType.Identifier) {
                node.params = {
                    content: "\\GET",
                    name: getToken().value
                }
            }

            nextToken();
            token = getToken();

            if (token.type !== TokenType.Shape) {
                error(`Expected ')' after value, but got: ${token.value} (Type: ${token.type} at index ${currentIndex})`);
            }

        } else if (token.type === TokenType.Datatype) {
            const varType = getToken().value;
            nextToken();
            token = getToken();
            const varName = getToken().value;
            nextToken();
            token = getToken();

            if (token.type !== TokenType.Assign) {
                error("Undefined assigner");
            } 

            nextToken();
            let val;;
            if((token.value.startsWith('"') || token.value.startsWith("'"))) {
                val = collectString();
            }else {
                val = getToken().value;
            }
            const value = val;


            const isNULL: boolean = value === "null";
            switch(varType) {
                case "int":
                    if(isNaN(Number(value)) && !isNULL) {
                        error("Variable"+value+" is not a number");
                    }
                    break;

                case 'string':
                    if (!(
                        (value.startsWith('"') || value.endsWith('"')) ||
                        (value.startsWith("'") || value.endsWith("'")) ||
                        (value.startsWith('`') || value.endsWith('`')) 
                    )&& !isNULL) {
                        error("Variable"+value+" is not a string");
                    }
                    break;

                case 'boolean':
                    if (
                        !(value.match(/\b(true|false)\b/))&& !isNULL
                    ) {
                        error("Variable"+value+" is not a boolean");
                    }
            }

            node.type = NodeType.DECLARE
            node.params = {
                name: varName,
                type: varType,
                value: value
            }
        } else if (token.type === TokenType.Conditional) {
            switch(token.value) {
                case 'if':
                    node.type = NodeType.IF;
                    nextToken();
                    token = getToken();
                    if (token.type !== TokenType.Shape) {
                        error(`Expected '(' after 'if', but got: ${token.value} (Type: ${token.type})`);
                    }
                    nextToken();
                    const condition = collectParam();
                    // if ( closed == false ) {
                    // }

                    const firstParam = condition[0];

                    if (firstParam.type !== TokenType.Identifier && firstParam.type !== TokenType.Value) {
                        error(`Expected identifier after 'if', but got: ${firstParam.value} (Type: ${firstParam.type})`);
                    }
                    if (condition[1]) {
                        const conditional = condition[1];

                        if (conditional.type !== TokenType.Operator) {
                            error(`Expected operator after identifier, but got: ${conditional.value} (Type: ${conditional.type})`);
                        }

                        if (condition[2]) {
                            const secondParam = condition[2];
                            if (secondParam.type !== TokenType.Identifier && secondParam.type !== TokenType.Value) {
                                error(`Expected identifier after operator, but got: ${secondParam.value} (Type: ${secondParam.type})`);
                            }

                            node.params = {
                                condition: {
                                    firstValue: firstParam.type === TokenType.Identifier ?
                                        "\\GET" :
                                        firstParam.value,
                                    cond: conditional.value,
                                    secondValue: secondParam.type === TokenType.Identifier ?
                                        "\\GET" :
                                        secondParam.value,
                                    firstName: firstParam.type === TokenType.Identifier ?
                                        firstParam.value :
                                        undefined,
                                    secondName: secondParam.type === TokenType.Identifier ?
                                        secondParam.value :
                                        undefined
                                }
                            }
                        }
                    } else {
                        node.params = {
                            condition: {
                                firstValue: firstParam.value,
                                secondValue: "true",
                                cond: "=="
                            }
                        }
                    }
                    break;
            }
        } else if (token.type === TokenType.TGIO) {
            node.type = NodeType.SHOW;
            nextToken();
            const tags = collectTag();

            const joinedTags = tags.join(' ');

            nextToken();
            if (getToken().value !== 'as') {
                error(`Expected 'as' after value, but got: ${getToken().value} (Type: ${getToken().type} at index ${currentIndex})`);
            }

            nextToken();

            node.params = {
                content: joinedTags,
                route: sanitizeTokenValue(getToken().value)
            }
        } else if (token.type === TokenType.EOF) {
                break;
        } else {
            error(`Unexpected token: ${token.value} (Type: ${token.type})`);
        }

        nextToken();
        nodes.push(node);
    }

    return nodes.map(NodeAdapter);
};

const getToken = (): Token => {
    return tokens[currentIndex];
};

const nextToken = (): void => {
    currentIndex++;
};

const collectString = (): string => {
    let token = getToken();
    let str: string = '';

    while (token.type !== TokenType.Shape && !isStringEnd(token.value)) {
        str += sanitizeTokenValue(token.value);
        nextToken();
        token = getToken();
        str += ' '; 
    }

    str += sanitizeTokenValue(token.value);
    return str.trim();
};


const collectParam = (): Token[] => {
    let token = getToken();
    let param: Token[] = [];

    while (token.type !== TokenType.Shape) {
        param.push(token);
        nextToken();
        token = getToken();
    }

    return param.map(token => ({
        type: token.type, value: token.value.trim()
    }));
};

const collectTag = (): string[] => {
    let token = getToken();
    let param: string[] = [];

    while (token.type !== TokenType.TGIO) {
        param.push(token.value.trim());
        nextToken();
        token = getToken();
    }

    return param;
};

const isStringEnd = (value: string): boolean => {
    return value.endsWith(')');
};


const sanitizeTokenValue = (value: string): string => {
    return value.replace(/["'`]/g, '').replace(/\n/g, '').replace(/\r/g, '').replace('%', ' ');
};
