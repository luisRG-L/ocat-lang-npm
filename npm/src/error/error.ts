import { ErrorType } from "./types";

export const error = (message: string | undefined, line: number, type: ErrorType = ErrorType.UError) => {
    if(message ){
        console.log(`
Error at line ${line}:
    '${message}'
of type ${type}
`);
        process.exit(1);
    }
}