export const TaskRealtimeEvent = {
    Connected: 'task-realtime:connected',

    TaskRoomJoined: 'task-room:joined',
    TaskRoomLeft: 'task-room:left',

    TaskCreated: 'task:created',
    TaskAssigned: 'task:assigned',
} as const;

export type TaskRealtimeEventName =
    (typeof TaskRealtimeEvent)[keyof typeof TaskRealtimeEvent];

export type TaskActorPayload = {
    userId: string;
    name?: string;
    email?: string;
};

export type TaskCreatedEventPayload = {
    taskId: string;
    workspaceId: string;
    projectId: string;
    title: string;
    status: string;
    priority: string;
    assigneeIds?: string[];
    createdBy: TaskActorPayload;
    createdAt: string;
};

export type TaskAssignedEventPayload = {
    taskId: string;
    workspaceId: string;
    projectId: string;
    assigneeId: string;
    assignedBy: TaskActorPayload;
    assignedAt: string;
};