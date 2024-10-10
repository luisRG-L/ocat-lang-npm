export interface Param {
    content?: string;
    cause?: string;
    name?: string;
    type?: string;
    value?: string;
    valueType?: string;
    valueContent?: string;
    condition?: Condition;
    route?: string;
}

export interface Condition {
    firstValue?: string;
    secondValue?: string;
    cond?: string;
    firstName?: string;
    secondName?: string;
}