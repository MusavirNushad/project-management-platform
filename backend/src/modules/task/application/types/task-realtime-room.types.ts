export const TaskRealtimeRoom = {
    user: (userId: string) => `user:${userId}`,
    project: (projectId: string) => `project:${projectId}`,
    task: (taskId: string) => `task:${taskId}`,
} as const;

export type TaskRealtimeRoomName = ReturnType<
    (typeof TaskRealtimeRoom)[keyof typeof TaskRealtimeRoom]
>;