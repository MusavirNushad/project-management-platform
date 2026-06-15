export const RealtimeEvent = {
    Connected: 'realtime:connected',

    WorkspaceJoined: 'workspace:joined',
    WorkspaceLeft: 'workspace:left',

    ProjectJoined: 'project:joined',
    ProjectLeft: 'project:left',

    TaskRoomJoined: 'task-room:joined',
    TaskRoomLeft: 'task-room:left',

    WorkspaceMemberAdded: 'workspace:member-added',
    WorkspaceMemberRemoved: 'workspace:member-removed',

    ProjectMemberAdded: 'project:member-added',
    ProjectMemberRemoved: 'project:member-removed',

    TaskCreated: 'task:created',
    TaskAssigned: 'task:assigned',
} as const;

export type RealtimeEventName =
    (typeof RealtimeEvent)[keyof typeof RealtimeEvent];

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

export type ProjectMemberAddedEventPayload = {
    workspaceId: string;
    projectId: string;
    memberId: string;
    roleName?: string;
    addedBy: ActorPayload;
    addedAt: string;
};

export type ProjectMemberRemovedEventPayload = {
    workspaceId: string;
    projectId: string;
    memberId: string;
    removedBy: ActorPayload;
    removedAt: string;
};

export type TaskCreatedEventPayload = {
    taskId: string;
    workspaceId: string;
    projectId: string;
    title: string;
    status: string;
    priority?: string | null;
    assigneeIds?: string[];
    createdBy: ActorPayload;
    createdAt: string;
};

export type TaskAssignedEventPayload = {
    taskId: string;
    workspaceId: string;
    projectId: string;
    assigneeId: string;
    assignedBy: ActorPayload;
    assignedAt: string;
};