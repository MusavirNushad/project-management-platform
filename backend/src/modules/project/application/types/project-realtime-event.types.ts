export const ProjectRealtimeEvent = {
    Connected: 'project-realtime:connected',

    ProjectJoined: 'project:joined',
    ProjectLeft: 'project:left',

    ProjectMemberAdded: 'project:member-added',
    ProjectMemberRemoved: 'project:member-removed',
} as const;

export type ProjectRealtimeEventName =
    (typeof ProjectRealtimeEvent)[keyof typeof ProjectRealtimeEvent];

export type ProjectActorPayload = {
    userId: string;
    name?: string;
    email?: string;
};

export type ProjectMemberAddedEventPayload = {
    workspaceId: string;
    projectId: string;
    memberId: string;
    roleName?: string;
    addedBy: ProjectActorPayload;
    addedAt: string;
};

export type ProjectMemberRemovedEventPayload = {
    workspaceId: string;
    projectId: string;
    memberId: string;
    removedBy: ProjectActorPayload;
    removedAt: string;
};