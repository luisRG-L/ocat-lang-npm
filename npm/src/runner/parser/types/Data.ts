import { RestMode } from "./Backend";

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
    mode?: RestMode;
    url?: string;
}

export interface Condition {
    cond?: string;
    body?: string;
}
