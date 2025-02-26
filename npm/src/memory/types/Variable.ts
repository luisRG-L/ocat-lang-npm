export interface Variable<T = string | { [key: string]: string }> {
    name: string;
    type: string;
    value: T;
}
