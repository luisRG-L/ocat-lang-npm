import { CustomError, ErrorType, Warning } from "../error";
import { Variable, Component, Function } from "./types/";
import { _Object } from "./classes";

export class Memory {
    
    private variables: Map<string, Variable> = new Map();
    private components: Map<string, Component> = new Map();
    private functions: Map<string, Function> = new Map();
    private objects: Map<string, _Object> = new Map();
    private orders: Map<string, string> = new Map();

    private strict: boolean = false;

    constructor(strict?: boolean) {
        this.strict = strict ?? false;
    }

    // Config

    public setStrict() {
        this.strict = true;
    }

    setOrder(name: string | undefined, content: string | undefined) {
        if (name && content) {
            this.orders.set(name, content);
        }
    }

    getOrder(name: string | undefined) {
        if (name) {
            return this.orders.get(name);
        }
    }

    public copyFrom(memory: Memory) {
        memory.getVars.forEach((element) =>
            this.declareVar(
                element.name,
                element.value as string | undefined,
                element.type
            )
        );
        memory.getComponents.forEach((element) =>
            this.declareComponent(
                element.name,
                element.value as string | undefined
            )
        );
        memory.getFunctions.forEach((element) =>
            this.declareFunction(
                element.name,
                element.content as string | undefined
            )
        );
    }

    // Variables

    public declareVar(name?: string, value?: string, type?: string) {
        if (name && value && type) {
            if (this.variables.has(name)) {
                if (this.strict) {
                    throw new CustomError(
                        `Cannot declare variable ${name} because it already exists`,
                        ErrorType.GetError
                    );
                } else {
                    this.variables.delete(name);
                    throw new Warning(
                        `Cannot declare variable ${name} because it already exists`
                    );
                }
            }
            this.variables.set(name, {
                name: name,
                type: type,
                value: value,
            });
        }
    }

    public changeVar(name?: string, value?: string) {
        if (name && value) {
            if (this.variables.has(name)) {
                this.variables.set(name, {
                    name: name,
                    type: this.variables.get(name)?.type ?? "string",
                    value: value,
                });
            } else {
                if (this.strict) {
                    throw new CustomError(
                        `Cannot change variable ${name} because it does not exist`,
                        ErrorType.GetError
                    );
                } else {
                    this.variables.set(name, {
                        name: name,
                        type: "string",
                        value: value,
                    });
                    throw new Warning(
                        `Cannot change variable ${name} because it does not exist`
                    );
                }
            }
        }
    }

    public getVar(name?: string) {
        if (name) {
            return this.variables.get(name);
        }
    }

    public get getVars() {
        return this.variables;
    }

    // Components

    public getComponent(name?: string) {
        if (name) {
            return this.components.get(name)?.value;
        }
    }

    public declareComponent(name?: string, value?: string) {
        if (name && value) {
            this.components.set(name, {
                name: name,
                value: value,
            });
        }
    }

    public get getComponents() {
        return this.components;
    }

    // Functions

    public declareFunction(name?: string, value?: string) {
        if (name && value) {
            this.functions.set(name, {
                name: name,
                content: value,
            });
        }
    }

    public getFunction(name?: string) {
        if (name) {
            return this.functions.get(name);
        }
    }

    public get getFunctions() {
        return this.functions;
    }

    public get isStrict() {
        return this.strict;
    }

    // Objects

    public declareObject(name: string) {
        this.objects.set(name, new _Object(this.objects.size, name));
    }

    public getObject(name: string) {
        return this.objects.get(name);
    }

    public get getObjects() {
        return this.objects;
    }
}
