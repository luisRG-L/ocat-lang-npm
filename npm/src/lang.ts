import fs from 'fs';
import path from 'path';
import { 
    // From the lexer
    tokenize,

    // From the parser
    parse, Node as PNode,

    // From the runner
    run
} from './runner/';

export function init (test: boolean, dev: boolean, fileName: string) {
    if(test) {
        console.time("Start");
    }

    if (!fileName || !fileName.endsWith('.ocat')) {
        console.error('Please provide a valid file name.');
        process.exit(1);
    }
    
    const filePath = path.join(process.cwd(), fileName);
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            process.exit(1);
        }
        
        if(test) {
            console.time("Lexer");
        }
        const tokens = tokenize(data);
            if(dev) {
                console.log(tokens);
            }
        if(test) {
            console.timeEnd("Lexer");
            console.time("Parser");
        }
    
        const nodes = parse(tokens) as PNode[];
        if (dev) {
            console.log(nodes);
        }
    
        if(test) {
            console.timeEnd("Parser");
            console.time("Runner");
        }

        run(nodes);

        if (test) {
            console.timeEnd("Runner");
        }
    });
    if(test) {
        console.timeEnd("Start");
    }
}