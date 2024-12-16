export enum TokenType {
    Identifier = "Identifier",
    EOF = "EOF",
    Value = "Value",
    IO = "IO",
    Datatype = "Datatype",
    Function = "Function",
    FCall = "Function Call",
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
    Comment = "Comment",
    Component = "Component",
    Meta = "Meta",
    ExportW = "Wexport",
    Block = "Block",
    SCS = "Source Control Sentence",
    ORDER = "ORDER",
    Layout = "Layout",
    RestI = "RestI",
    Load = "Load",
}

export interface Token {
    type: TokenType;
    value: string;
}
