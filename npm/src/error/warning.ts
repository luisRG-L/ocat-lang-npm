import derr from "./derr";

export class Warning {
    readonly message: string;

    constructor(message: string) {
        this.message = message;
    }

    display(line: number) {
        derr(() => {
            console.log(`WARN at line ${line} '${this.message}'`);
        });
    }
}
