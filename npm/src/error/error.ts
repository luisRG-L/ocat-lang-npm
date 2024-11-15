import { ErrorType } from "./types";
import derr from "./derr";

export class CustomError {
    readonly message: string;
    readonly type: ErrorType;

    constructor(message: string, type: ErrorType) {
        this.message = message;
        this.type = type;
    }

    public display(line: number) {
        derr(() => {
            console.log(`CustomError at line ${line}:
    '${this.message}'
of type ${this.type}`);
        });
    }
}

export class OSyntaxError extends CustomError {
    constructor(message: string) {
        super(message, ErrorType.SyntaxError);
    }
}
