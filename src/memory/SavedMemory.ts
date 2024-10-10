import { Variable } from './types/index.js';

export class Memory {
    private variables: Map<string, Variable> = new Map();

    public declareVar(name?: string, value?: string, type?: string) {
        if(name && value && type) {
            this.variables.set(name, {
                name: name,
                type: type,
                value: value
            });
        }
    }

    public getVar(name?: string) {
        if(name) {
            return this.variables.get(name);
        }
    }
}