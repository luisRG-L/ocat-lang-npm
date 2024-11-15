import { Memory, Variable } from "../../memory";
import { isValue } from "../lexer/utils";

export function getType(val: string) {
    if (val === "true" || val === "false") {
        return "bool";
    } else if (!isNaN(Number(val))) {
        return "int";
    } else if (val.startsWith('"') || val.endsWith('"')) {
        return "string";
    } else {
        return "undefined";
    }
}

export function getValue(val: string, memory: Memory): Variable {
    if (isValue(val)) {
        return { value: val, type: getType(val), name: val };
    } else {
        return (
            memory.getVar(val) ?? {
                value: "onotdefined",
                type: "string",
                name: val,
            }
        );
    }
}
