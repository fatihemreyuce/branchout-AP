import { fetchClient } from "@/utils/fetch-client";
import type { NotificationRequest, NotificationResponse } from "@/types/notifications.types";
import type { Page } from "@/types/pagination.types";

export function getNotifications( page: number, size: number, sort: string): Promise<Page<NotificationResponse>> {
    return fetchClient<void, Page<NotificationResponse>>(`/admin/notifications?page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`, {
        method: "GET",
    });
}

export function createNotification(notification: NotificationRequest): Promise<NotificationResponse> {
    return fetchClient<NotificationRequest, NotificationResponse>("/admin/notifications", {
        method: "POST",
        body: notification,
    });
}

export function updateNotification(id: number, notification: NotificationRequest): Promise<NotificationResponse> {
    return fetchClient<NotificationRequest, NotificationResponse>(`/admin/notifications/${id}`, {
        method: "PUT",
        body: notification,
    });
}

export function deleteNotification(id: number): Promise<void> {
    return fetchClient<void, void>(`/admin/notifications/${id}`, {
        method: "DELETE",
    });
}

export function getNotificationsById(id: number): Promise<NotificationResponse> {
    return fetchClient<void, NotificationResponse>(`/admin/notifications/${id}`, {
        method: "GET",
    });
}

export function sendNotification(id: number): Promise<void> {
    return fetchClient<void, void>(`/admin/notifications/${id}/send`, {
        method: "POST",
    });
}