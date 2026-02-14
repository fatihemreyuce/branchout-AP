import { useAuthQuery } from "./use-auth-query";
import { getBackups, createBackup, getBackup, deleteBackup, downloadBackup } from "@/services/backups-service";
import type { BackupResponse } from "@/types/backups.types";
import type { Page } from "@/types/pagination.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useBackups = (page: number, size: number) => {
    return useAuthQuery<Page<BackupResponse>>({
        queryKey: ["backups", page, size],
        queryFn: () => getBackups(page, size),
    });
}

export const useCreateBackup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (type: "DATABASE" | "UPLOADS" | "FULL") => createBackup(type),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["backups"] });
            toast.success("Backup oluşturuldu");
        },
        onError: () => {
            toast.error("Backup oluşturulurken bir hata oluştu");
        },
    });
}

export const useGetBackup = (id: number) => {
    return useAuthQuery<BackupResponse>({
        queryKey: ["backup", id],
        queryFn: () => getBackup(id),
    });
}

export const useDeleteBackup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteBackup(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["backups"] });
            toast.success("Backup silindi");
        },
        onError: () => {
            toast.error("Backup silinirken bir hata oluştu");
        },
    });
}

export const useDownloadBackup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, filename }: { id: number; filename?: string }) =>
            downloadBackup(id, filename),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["backups"] });
            toast.success("Backup indirildi");
        },
        onError: () => {
            toast.error("Backup indirilirken bir hata oluştu");
        },
    });
}