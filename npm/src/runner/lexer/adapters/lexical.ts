import { CustomError, ErrorType } from "../../../error";

export const Lexical: (input: string) => string[] = (input: string) => {
    if (input) {
        return input
            .replace(/\n/g, " \n ")
            .split(" ")
            .map((word) => word.trim());
    } else {
        throw new CustomError(
            "Please provide a valid input",
            ErrorType.RuntimeError
        );
    }
    return [];
};
