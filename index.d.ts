declare namespace CLI {
    interface argv {
        init: string;
        create: boolean;
        service: string;
        connect: string;
        help: boolean;
        addons: string[];
        build: boolean;
        type: string;
    }

    interface REPLOptions {
        host: string;
        port: number;
    }

    export function initAgent(name?: string, addons?: string[]): Promise<void>;
    export function addAddon(name: string): Promise<void>;
    export function create(type?: string, config?: any): Promise<void>;
    export function service(action?: string): Promise<void>;
}

export as namespace CLI;
export = CLI;
