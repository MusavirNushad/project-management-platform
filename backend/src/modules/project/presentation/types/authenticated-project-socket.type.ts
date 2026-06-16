import type { Socket } from 'socket.io';

export type AuthenticatedProjectSocketUser = {
    userId: string;
    email: string;
};

export type AuthenticatedProjectSocket = Socket & {
    data: {
        user?: AuthenticatedProjectSocketUser;
    };
};