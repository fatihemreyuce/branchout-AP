import { useAuthQuery } from "./use-auth-query";
import { getPartners, createPartner, updatePartner, deletePartner, getPartnerById } from "@/services/partners-service";
import type { PartnerRequest, PartnerResponse } from "@/types/partners.types";
import type { Page } from "@/types/pagination.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const usePartners = () => {
	return useAuthQuery<Page<PartnerResponse>>({
		queryKey: ["partners"],
		queryFn: () => getPartners(),
	});
}

export const useCreatePartner = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (request: PartnerRequest) => createPartner(request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["partners"] });
			toast.success("Partner başarıyla oluşturuldu");
		},
		onError: () => {
			toast.error("Partner oluşturulurken bir hata oluştu");
		},
	});
}

export const useUpdatePartner = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, request }: { id: number; request: PartnerRequest }) => updatePartner(id, request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["partners"] });
			toast.success("Partner başarıyla güncellendi");
		},
		onError: () => {
			toast.error("Partner güncellenirken bir hata oluştu");
		},
	});
}

export const useDeletePartner = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => deletePartner(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["partners"] });
			toast.success("Partner başarıyla silindi");
		},
		onError: () => {
			toast.error("Partner silinirken bir hata oluştu");
		},
	});
}

export const usePartnerById = (id: number) => {
	return useAuthQuery<PartnerResponse>({
		queryKey: ["partner", id],
		queryFn: () => getPartnerById(id),
	});
}
