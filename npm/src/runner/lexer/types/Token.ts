export enum TokenType {
    Identifier = "Identifier",
    EOF = "EOF",
    Value = "Value",
    IO = "IO",
    Datatype = "Datatype",
    Function = "Function",
    Conditional = "Conditional",
    Loop = "Loop",
    Keyword = "Keyword",
    Operator = "Operator",
    Punctuation = "Punctuation",
    Shape = "Shape",
    Null = "Null",
    Assign = "Assign",
    PageRequest = "Page-Request",
    IERQ = "IMPORT/EXPORT REQUEST",
    EOL = "End of Line",
}

export interface Token {
    type: TokenType;
    value: string;
}