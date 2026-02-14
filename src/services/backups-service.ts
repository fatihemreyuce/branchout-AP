import { fetchClient } from "@/utils/fetch-client";
import { getAccessToken } from "@/utils/token-manager";
import type { BackupRequest, BackupResponse } from "@/types/backups.types";
import type { Page } from "@/types/pagination.types";

export function getBackups(page: number, size: number): Promise<Page<BackupResponse>> {
    return fetchClient<void, Page<BackupResponse>>(`/admin/backups?page=${page}&size=${size}`, {
        method: "GET",
    });
}

export function createBackup(type: BackupResponse["backupType"]): Promise<BackupResponse> {
    const body: BackupRequest = { type };
    return fetchClient<BackupRequest, BackupResponse>("/admin/backups/create", {
        method: "POST",
        body,
    });
}

export function getBackup(id: number): Promise<BackupResponse> {
    return fetchClient<void, BackupResponse>(`/admin/backups/${id}`, {
        method: "GET",
    });
}

export function deleteBackup(id: number): Promise<void> {
    return fetchClient<void, void>(`/admin/backups/${id}`, {
        method: "DELETE",
    });
}

/** İndirme dosya (blob) döndüğü için ayrı fetch kullanır; filename indirilen dosya adı için kullanılır. */
export async function downloadBackup(id: number, filename?: string): Promise<void> {
    const base = typeof window !== "undefined" ? "" : "";
    const url = `${base}/api/v1/admin/backups/${id}/download`;
    const token = getAccessToken();
    const headers: HeadersInit = {
        Accept: "application/octet-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const response = await fetch(url, { method: "GET", headers, credentials: "include" });
    if (!response.ok) throw new Error("Backup indirilemedi");
    const blob = await response.blob();
    const name =
        filename ||
        response.headers.get("Content-Disposition")?.match(/filename="?([^";\n]+)"?/)?.[1] ||
        `backup-${id}.zip`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
    URL.revokeObjectURL(link.href);
}