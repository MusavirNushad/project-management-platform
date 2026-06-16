import type { Socket } from 'socket.io';

export type AuthenticatedWorkspaceSocketUser = {
    userId: string;
    email: string;
};

export type AuthenticatedWorkspaceSocket = Socket & {
    data: {
        user?: AuthenticatedWorkspaceSocketUser;
    };
};