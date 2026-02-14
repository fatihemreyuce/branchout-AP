import { useAuthQuery } from "./use-auth-query";
import { getNotifications, createNotification, updateNotification, deleteNotification, getNotificationsById, sendNotification } from "@/services/notifications-service";
import type { NotificationRequest, NotificationResponse } from "@/types/notifications.types";
import type { Page } from "@/types/pagination.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useNotifications = ( page: number, size: number, sort: string) => {
    return useAuthQuery<Page<NotificationResponse>>({
        queryKey: ["notifications", page, size, sort],
        queryFn: () => getNotifications(page, size, sort),
    });
}

export const useCreateNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: NotificationRequest) => createNotification(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            toast.success("Bildirim başarıyla oluşturuldu");
        },
        onError: () => {
            toast.error("Bildirim oluşturulurken bir hata oluştu");
        },
    });
}

export const useUpdateNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, request }: { id: number; request: NotificationRequest }) => updateNotification(id, request),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notification", variables.id] });
            toast.success("Bildirim başarıyla güncellendi");
        },
        onError: () => {
            toast.error("Bildirim güncellenirken bir hata oluştu");
        },
    });
}

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteNotification(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notification", id] });
            toast.success("Bildirim başarıyla silindi");
        },
        onError: () => {
            toast.error("Bildirim silinirken bir hata oluştu");
        },
    });
}

export const useGetNotificationById = (id: number) => {
    return useAuthQuery<NotificationResponse>({
        queryKey: ["notification", id],
        queryFn: () => getNotificationsById(id),
    });
}

export const useSendNotification = () => {
    return useMutation({
        mutationFn: (id: number) => sendNotification(id),
        onSuccess: () => {
            toast.success("Bildirim başarıyla gönderildi");
        },
        onError: () => {
            toast.error("Bildirim gönderilirken bir hata oluştu");
        },
    });
}