import fs from "fs";
import path from "path";
import {
    // From the lexer
    tokenize,

    // From the parser
    parse,
    Node as PNode,

    // From the runner
    run,
} from "./runner/";
import { Memory } from "./memory";
import { CustomError, ErrorType } from "./error";

export function rund(test: boolean, dev: boolean, content: string) {
    if (test) {
        console.time("Lexer");
    }
    const tokens = tokenize(content);
    if (dev) {
        console.log(tokens);
    }
    if (test) {
        console.timeEnd("Lexer");
        console.time("Parser");
    }

    const nodes = parse(tokens) as PNode[];
    if (dev) {
        console.log(nodes);
    }

    if (test) {
        console.timeEnd("Parser");
        console.time("Runner");
    }

    const memory = run(nodes);

    if (test) {
        console.timeEnd("Runner");
    }

    return memory;
}

export function init(test: boolean, dev: boolean, fileName: string) {
    if (test) {
        console.time("Start");
    }

    if (!fileName || !fileName.endsWith(".ocat")) {
        console.error("Please provide a valid file name.");
        process.exit(1);
    }

    const filePath = path.join(process.cwd(), fileName);

    // @Flag
    let memory: Memory = new Memory();

    if (!fs.existsSync(filePath)) {
        new CustomError(
            `File ${fileName} not found.`,
            ErrorType.RuntimeError
        ).display(0);
    }

    fs.readFile(
        filePath,
        "utf8",
        (err, data) => (memory = rund(test, dev, data))
    );
    if (test) {
        console.timeEnd("Start");
    }
    return memory;
}
