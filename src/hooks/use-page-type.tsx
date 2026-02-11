import { useAuthQuery } from "./use-auth-query";
import { getPageTypes, createPageType, updatePageType, deletePageType, getPageTypeById } from "@/services/page-type-service";
import type { PageTypeRequest, PageTypeResponse } from "@/types/page.type.types";
import type { Page } from "@/types/pagination.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const usePageTypes = (search: string, page: number, size: number, sort: string) => {
    return useAuthQuery<Page<PageTypeResponse>>({
        queryKey: ["page-types", search, page, size, sort],
        queryFn: () => getPageTypes(search, page, size, sort),
    });
}

export const useCreatePageType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (pageType: PageTypeRequest) => createPageType(pageType),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["page-types"] });
            toast.success("Sayfa tipi başarıyla oluşturuldu");
        },
        onError: () => {
            toast.error("Sayfa tipi oluşturulurken bir hata oluştu");
        },
    });
}

export const useUpdatePageType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, pageType }: { id: number; pageType: PageTypeRequest }) => updatePageType(id, pageType),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["page-types"] });
            toast.success("Sayfa tipi başarıyla güncellendi");
        },
        onError: () => {
            toast.error("Sayfa tipi güncellenirken bir hata oluştu");
        },
    });
}

export function useDeletePageType() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deletePageType(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["page-types"] });
            toast.success("Sayfa tipi başarıyla silindi");
        },
        onError: () => {
            toast.error("Sayfa tipi silinirken bir hata oluştu");
        },
    });
}

export const useGetPageTypeById = (id: number) => {
    return useAuthQuery<PageTypeResponse>({
        queryKey: ["page-type", id],
        queryFn: () => getPageTypeById(id),
    });
}