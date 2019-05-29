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
}

export as namespace CLI;
export = CLI;
