export interface BackupRequest {
    type: string;
}

export interface BackupResponse {
    id: number;
    filename: string;
    filePath: string;
    fileSize: number;
    backupType: "DATABASE" | "UPLOADS" | "FULL";
    status: "IN_PROGRESS" | "SUCCESS" | "FAILED";
    errorMessage: string;
    createdAt: string;
    expiresAt: string;
}