export const WorkspaceRealtimeEvent = {
    Connected: 'workspace-realtime:connected',

    WorkspaceJoined: 'workspace:joined',
    WorkspaceLeft: 'workspace:left',

    WorkspaceMemberAdded: 'workspace:member-added',
    WorkspaceMemberRemoved: 'workspace:member-removed',
} as const;

export type WorkspaceRealtimeEventName =
    (typeof WorkspaceRealtimeEvent)[keyof typeof WorkspaceRealtimeEvent];

export type ActorPayload = {
    userId: string;
    name?: string;
    email?: string;
};

export type WorkspaceMemberAddedEventPayload = {
    workspaceId: string;
    memberId: string;
    roleName?: string;
    addedBy: ActorPayload;
    addedAt: string;
};

export type WorkspaceMemberRemovedEventPayload = {
    workspaceId: string;
    memberId: string;
    removedBy: ActorPayload;
    removedAt: string;
};