import { Node, NodeType } from './types';
import  {Token, TokenType} from '../lexer/types';
import { error } from '../../error/error';
import { NodeAdapter } from '../../adapters/adapters';

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

        // Manejo de la instrucción 'print'
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
                node.params = { content: collectString() };
            } else if (token.type === TokenType.Identifier) {
                node.params = {
                    content: "\\GET",
                    name: getToken().value
                };
            }

            nextToken();
            token = getToken();

        } else if (token.type === TokenType.Datatype) {
            // Manejo de la declaración de variable
            const varType = token.value;
            nextToken();
            token = getToken();
            const varName = token.value; // Obtener el nombre de la variable
            nextToken();
            token = getToken();

            if (token.type !== TokenType.Assign) {
                error("Undefined assigner");
            }

            nextToken();
            let val: string;
            if (token.value.startsWith('"') || token.value.startsWith("'")) {
                val = collectString();
            } else {
                val = getToken().value;
            }

            const isNULL: boolean = val === "null";
            switch (varType) {
                case "int":
                    if (isNaN(Number(val)) && !isNULL) {
                        error(`Variable ${val} is not a number`);
                    }
                    break;

                case 'string':
                    if (!(
                        (val.startsWith('"') && val.endsWith('"')) ||
                        (val.startsWith("'") && val.endsWith("'")) ||
                        (val.startsWith('`') && val.endsWith('`'))
                    ) && !isNULL) {
                        error(`Variable ${val} is not a string`);
                    }
                    break;

                case 'boolean':
                    if (!(val.match(/\b(true|false)\b/) && !isNULL)) {
                        error(`Variable ${val} is not a boolean`);
                    }
                    break;
            }

            node.type = NodeType.DECLARE;
            node.params = {
                name: varName,
                type: varType,
                value: val
            };

        } else if (token.type === TokenType.Conditional) {
            /*switch (token.value) {
                case 'if':
                    node.type = NodeType.IF;
                    nextToken();
                    token = getToken();

                    if (token.type !== TokenType.Shape) {
                        error(`Expected '(' after 'if', but got: ${token.value} (Type: ${token.type})`);
                    }

                    nextToken();
                    const condition = collectParam();
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
                                    firstValue: firstParam.type === TokenType.Identifier ? "\\GET" : firstParam.value,
                                    cond: conditional.value,
                                    secondValue: secondParam.type === TokenType.Identifier ? "\\GET" : secondParam.value,
                                    firstName: firstParam.type === TokenType.Identifier ? firstParam.value : undefined,
                                    secondName: secondParam.type === TokenType.Identifier ? secondParam.value : undefined
                                }
                            };
                        }
                    } else {
                        node.params = {
                            condition: {
                                firstValue: firstParam.value,
                                secondValue: "true",
                                cond: "=="
                            }
                        };
                    }
                    break;
            }*/
        } else if (token.type === TokenType.TGIO) {
            // Manejo de la instrucción 'show'
            node.type = NodeType.SHOW;
            nextToken();
            const tags = collectTag();
            const joinedTags = tags.join(' ');

            nextToken();
            if (!getToken() || getToken().value !== 'as') {
                error(`Expected 'as' after value, but got: ${getToken() ? getToken().value : '??'} (Type: ${getToken().type} at index ${currentIndex})`);
            }

            nextToken();
            node.params = {
                content: joinedTags,
                route: sanitizeTokenValue(getToken().value)
            };

        } else if (token.value === 'component') {
            // Manejo de la declaración de componentes
            nextToken();
            token = getToken();

            if (token.type !== TokenType.Identifier) {
                error(`Expected identifier after 'component', but got: ${token.value} (Type: ${token.type})`);
            }

            node.type = NodeType.CDECLARE;
            nextToken();
            token = getToken();

            const tags = collectTag().join(' ');
            node.params = {
                name: token.value,
                content: tags
            };

        } else if (token.type === TokenType.IERQ) {
            // Manejo de la instrucción 'import'
            node.type = NodeType.IMPORT;
            nextToken();
            token = getToken();

            if (token.type !== TokenType.Identifier) {
                error(`Expected identifier after 'import', but got: ${token.value} (Type: ${token.type})`);
            }

            node.params = {
                name: token.value
            };
        } else if (token.value === '#') {
            // This is a comment
            nextToken();
            token = getToken();
            while (token.value !== '#') {
                nextToken();
                token = getToken();
            }
            nextToken();
            node.type=NodeType.NONE;
        } else if (token.value === 'exec') {
            nextToken();
            node.type=NodeType.EXEC;
            const command = collectString();
            node.params={
                content: command
            }
        } else if (token.type === TokenType.EOF) {
            // Fin del archivo
            break;
        } else {
            error(`Unexpected token: ${token.value} (Type: ${token.type})`);
        }

        nextToken();
        nodes.push(node);
    }

    return nodes.map(NodeAdapter);
};

// Funciones auxiliares
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
        str += sanitizeTokenValue(token.value) + ' ';
        nextToken();
        token = getToken();
    }

    str += sanitizeTokenValue(token.value); // Añadir el último token
    return str.trim();
};

/*const collectParam = (): Token[] => {
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
};*/

const collectTag = (): string[] => {
    let token = getToken();
    const param: string[] = [];

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
