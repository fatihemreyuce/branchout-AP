import { useAuthQuery } from "./use-auth-query";
import { getEcoPartners, createEcoPartner, updateEcoPartner, deleteEcoPartner, getEcoPartnerById } from "@/services/eco-partners-service";
import type { EcoPartnerRequest, EcoPartnerResponse } from "@/types/eco.partners.types";
import type { Page } from "@/types/pagination.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useEcoPartners = () => {
    return useAuthQuery<Page<EcoPartnerResponse>>({
        queryKey: ["eco-partners"],
        queryFn: () => getEcoPartners(),
    });
}

export const useCreateEcoPartner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: EcoPartnerRequest) => createEcoPartner(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["eco-partners"] });
            toast.success("Eco Partner başarıyla oluşturuldu");
        },
        onError: () => {
            toast.error("Eco Partner oluşturulurken bir hata oluştu");
        },
    });
}

export const useUpdateEcoPartner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, request }: { id: number; request: EcoPartnerRequest; silent?: boolean }) =>
            updateEcoPartner(id, request),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["eco-partners"] });
            if (variables.silent !== true) {
                toast.success("Eco Partner başarıyla güncellendi");
            }
        },
        onError: (_, variables) => {
            if (variables?.silent !== true) {
                toast.error("Eco Partner güncellenirken bir hata oluştu");
            }
        },
    });
}

export const useDeleteEcoPartner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteEcoPartner(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["eco-partners"] });
            toast.success("Eco Partner başarıyla silindi");
        },
        onError: () => {
            toast.error("Eco Partner silinirken bir hata oluştu");
        },
    });
}

export const useEcoPartnerById = (id: number) => {
    return useAuthQuery<EcoPartnerResponse>({
        queryKey: ["eco-partner", id],
        queryFn: () => getEcoPartnerById(id),
    });
}