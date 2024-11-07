export enum TokenType {
    Identifier,
    EOF,
    Value,
    IO,
    Datatype,
    Function,
    Conditional,
    Loop,
    Keyword,
    Operator,
    Punctuation,
    Shape,
    Null,
    Assign,
    TGIO,
    IERQ
}

export interface Token {
    type: TokenType;
    value: string;
}