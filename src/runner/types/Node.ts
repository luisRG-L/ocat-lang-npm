import { Token } from './Token.js';
import { Param } from './Data.js'

export enum NodeType {
    OUTPUT,
    ERR,
    DECLARE,
    IF,
    SHOW,
    STYLE,
    IMPORT,
    CDECLARE,
    NONE,
    EXEC
}

export interface Node {
    type: NodeType;
    params: Param;
    base: Token;
}
