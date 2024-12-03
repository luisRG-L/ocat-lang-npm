import { Token } from "../../lexer/types/";
import { Param } from "./Data";

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
    EXEC,
    META,
    EXPORTW,
    Function,
    FCall,
    Create,
    UseStrict,
    Layout,
    RestI,
    ORDER,
    LOAD,
}

export interface Node {
    type: NodeType;
    params: Param;
    base: Token;
    line: number;
}
