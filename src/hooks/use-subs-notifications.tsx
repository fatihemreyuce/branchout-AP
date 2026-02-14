import { useAuthQuery } from "./use-auth-query";
import {
	getNotificationsSubscribers,
	createNotificationsSubscribers,
	deleteNotificationsSubscribers,
} from "@/services/subs-notifications-service";
import type { notificationsSubscribersRequest, notificationsSubscribersResponse } from "@/types/subs.notifications.types";
import type { Page } from "@/types/pagination.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useNotificationsSubscribers = (page: number, size: number, sort: string) => {
	return useAuthQuery<Page<notificationsSubscribersResponse>>({
		queryKey: ["notifications-subscribers", page, size, sort],
		queryFn: () => getNotificationsSubscribers(page, size, sort),
	});
};

export const useCreateNotificationsSubscribers = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (request: notificationsSubscribersRequest) => createNotificationsSubscribers(request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications-subscribers"] });
			toast.success("Bildirim aboneleri başarıyla oluşturuldu");
		},
		onError: (err) => {
			toast.error(err instanceof Error ? err.message : "Bildirim aboneleri oluşturulurken bir hata oluştu");
		},
	});
};

export const useDeleteNotificationsSubscribers = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => deleteNotificationsSubscribers(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications-subscribers"] });
			toast.success("Bildirim aboneleri başarıyla silindi");
		},
		onError: (err) => {
			toast.error(err instanceof Error ? err.message : "Bildirim aboneleri silinirken bir hata oluştu");
		},
	});
};
