import { CustomError, ErrorType, Warning } from "../error";
import { Variable, Component, Function, UtilMap, DCollection } from "./types/";
import { _Object } from "./classes";
import { Theme } from "./types/Theme";

export class Memory {
    private variables: UtilMap<Variable> = new Map();
    private components: UtilMap<Component> = new Map();
    private functions: UtilMap<Function> = new Map();
    private objects: UtilMap<_Object> = new Map();
    private orders: UtilMap<string> = new Map();
    private templates: UtilMap<string> = new Map();
    private collections: UtilMap<DCollection[]> = new Map();
    private themes: UtilMap<Theme> = new Map();
    private properties: string[] = [];
    private actuallyTheme: string = "";

    private strict: boolean = false;

    constructor(strict?: boolean) {
        this.strict = strict ?? false;
    }

    // Config

    public addProperty(name: string) {
        if (!this.properties.includes(name)) {
            this.properties.push(name);
        }
    }

    public get getProperties() {
        return this.properties;
    }

    public setStrict() {
        this.strict = true;
    }

    public setOrder(name: string | undefined, content: string | undefined) {
        if (name && content) {
            if (name === "Set") {
                this.orders.set(this.orders.get("Def") ?? "", content);
                this.orders.delete("Def");
                this.addProperty(name);
            }
            this.orders.set(name, content);
        } else {
            if (name) {
                this.orders.set(name, "true");
            }
        }
    }

    public getOrder(name: string | undefined) {
        if (name) {
            return this.orders.get(name);
        }
    }

    public get getOrders() {
        return this.orders;
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

    public getVar<T>(name: string): Variable<T> | undefined {
        const variable = this.variables.get(name);
        if (typeof variable?.value === typeof ({} as T)) {
            return variable as Variable<T>;
        } else {
            return undefined;
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

    // Templates
    public declareTemplate(name: string, value: string) {
        this.templates.set(name, value);
    }

    public getTemplate(name: string) {
        return this.templates.get(name);
    }

    public get getTemplates() {
        return this.templates;
    }

    // Collections
    public declareCollection(name: string, value: DCollection[]) {
        this.collections.set(name, value);
    }

    public getCollection(name: string) {
        return this.collections.get(name);
    }

    public get getCollections() {
        return this.collections;
    }

    // Themes
    public declareTheme(name: string, properties: { [key: string]: string }) {
        this.themes.set(name, {
            name: name,
            properties: properties,
        });
    }

    public getTheme(name: string) {
        return this.themes.get(name);
    }

    public get getThemes() {
        return this.themes;
    }

    public getActuallyTheme() {
        const theme = this.getThemes.get(this.actuallyTheme);
        if (!theme) {
            throw new Error("No theme defined");
        }
        return theme;
    }

    public setActuallyTheme(name: string) {
        this.actuallyTheme = name;
    }
}
