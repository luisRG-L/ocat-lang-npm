import { Variable, Function } from "../types/";

export class _Object {
    private name: string;
    private properties: Map<string, Variable>;
    private methods: Map<string, Function>;
    private ctor: Function | null;

    constructor(order: number, name?: string) {
        this.name = name ?? `$.${order}`;
        this.properties = new Map();
        this.methods = new Map();
        this.ctor = null;
    }

    public set setCtor(ctor: Function) {
        this.ctor = ctor;
    }

    public contruct() {
        return this.ctor;
    }

    public addMethod(name: string, method: Function) {
        this.methods.set(name, method);
    }

    public addProperty(name: string, property: Variable) {
        this.properties.set(name, property);
    }

    public get getName() {
        return this.name;
    }

    public get getProperties() {
        return this.properties;
    }

    public get getMethods() {
        return this.methods;
    }

    public getMethod(name: string) {
        return this.methods.get(name);
    }

    public getProperty(name: string) {
        return this.properties.get(name);
    }
}
