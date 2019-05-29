declare namespace CLI {
    interface argv {
        init: string;
        connect: number;
        create: boolean;
        service: string;
        connect: string;
        help: boolean;
    }
}

export as namespace CLI;
export = CLI;
