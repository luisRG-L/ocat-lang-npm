import { Token } from '../../lexer/types/';
import { Param } from './Data';

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
