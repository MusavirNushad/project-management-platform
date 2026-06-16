export const ProjectRealtimeRoom = {
    user: (userId: string) => `user:${userId}`,
    project: (projectId: string) => `project:${projectId}`,
} as const;

export type ProjectRealtimeRoomName = ReturnType<
    (typeof ProjectRealtimeRoom)[keyof typeof ProjectRealtimeRoom]
>;