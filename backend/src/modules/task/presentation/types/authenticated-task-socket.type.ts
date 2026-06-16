import type { Socket } from 'socket.io';

export type AuthenticatedTaskSocketUser = {
    userId: string;
    email: string;
};

export type AuthenticatedTaskSocket = Socket & {
    data: {
        user?: AuthenticatedTaskSocketUser;
    };
};