export const WorkspaceRealtimeRoom = {
    user: (userId: string) => `user:${userId}`,
    workspace: (workspaceId: string) => `workspace:${workspaceId}`,
} as const;

export type WorkspaceRealtimeRoomName = ReturnType<
    (typeof WorkspaceRealtimeRoom)[keyof typeof WorkspaceRealtimeRoom]
>;