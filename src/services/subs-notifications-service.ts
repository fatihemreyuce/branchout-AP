import { fetchClient } from "@/utils/fetch-client";
import type { notificationsSubscribersRequest, notificationsSubscribersResponse } from "@/types/subs.notifications.types";
import type { Page } from "@/types/pagination.types";

export function getNotificationsSubscribers(
	page: number,
	size: number,
	sort: string
): Promise<Page<notificationsSubscribersResponse>> {
	return fetchClient<void, Page<notificationsSubscribersResponse>>(
		`/admin/notification-subscribers?page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`,
		{ method: "GET" }
	);
}

export function createNotificationsSubscribers(
	request: notificationsSubscribersRequest
): Promise<notificationsSubscribersResponse> {
	return fetchClient<notificationsSubscribersRequest, notificationsSubscribersResponse>(
		"/notification-subscribers",
		{ method: "POST", body: request }
	);
}

export function deleteNotificationsSubscribers(id: number): Promise<void> {
	return fetchClient<void, void>(`/admin/notification-subscribers/${id}`, {
		method: "DELETE",
	});
}