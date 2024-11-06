import { Variable, Component } from './types/';

export class Memory {
    private variables: Map<string, Variable> = new Map();
    private components: Map<string, Component> = new Map();

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



    public getComponent(name?: string) {
        if(name) {
            return this.components.get(name)?.value;
        }
    }

    public declareComponent(name?: string, value?: string) {
        if(name && value) {
            this.components.set(name, {
                name: name,
                value: value
            });
        }
    }
}