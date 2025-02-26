export interface OcatConfig {
    port: number;
    properties?: {
        defined: { [key: string]: string };
        provided: string[];
    };
    path?: {
        [key: string]: string;
    };
    views?: boolean;
    collections?: {
        [key: string]: string;
    };
}
