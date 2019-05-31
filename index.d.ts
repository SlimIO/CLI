declare namespace CLI {
    interface argv {
        init: string;
        connect: number;
        create: boolean;
        service: string;
        connect: string;
        help: boolean;
        addons: string[];
    }

    interface REPLOptions {
        host: string;
        port: number;
    }

    export function initAgent(name?: string, addons?: string[]): Promise<void>;
    export function addAddon(name: string): Promise<void>;
    export function create(): Promise<void>;
    export function service(action?: string): Promise<void>;
    export function connectAgent(options: REPLOptions): Promise<void>;
}

export as namespace CLI;
export = CLI;
