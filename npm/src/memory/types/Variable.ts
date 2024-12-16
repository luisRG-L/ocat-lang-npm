export interface Variable {
    name: string;
    type: string;
    value: string | { [key: string]: string };
}