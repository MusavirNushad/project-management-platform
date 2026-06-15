export const RealtimeRoom = {
    user: (userId: string) => `user:${userId}`,
    workspace: (workspaceId: string) => `workspace:${workspaceId}`,
    project: (projectId: string) => `project:${projectId}`,
    task: (taskId: string) => `task:${taskId}`,
} as const;

export type RealtimeRoomName = ReturnType<
    (typeof RealtimeRoom)[keyof typeof RealtimeRoom]
>;
