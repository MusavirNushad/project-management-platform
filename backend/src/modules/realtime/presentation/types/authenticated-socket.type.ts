import { Socket } from 'socket.io';

export type AuthenticatedSocketUser = {
    userId: string;
    email: string;
};

export type AuthenticatedSocket = Socket & {
    data: {
        user?: AuthenticatedSocketUser;
    };
};