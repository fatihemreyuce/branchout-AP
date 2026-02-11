import { useAuthQuery } from "@/hooks/use-auth-query";
import { getLanguages, createLanguage, updateLanguage, deleteLanguage, getLanguageById } from "@/services/languages-service";
import type { LanguageRequest, LanguageResponse } from "@/types/languages.types";
import type { Page } from "@/types/pagination.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useLanguages = (page: number, size: number, sort: string) => {
    return useAuthQuery<Page<LanguageResponse>>({
        queryKey: ["languages", page, size, sort],
        queryFn: () => getLanguages(page, size, sort),
    });
}

export const useCreateLanguage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (language: LanguageRequest) => createLanguage(language),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["languages"] });
            toast.success("Dil başarıyla oluşturuldu");
        },
        onError: () => {
            toast.error("Dil oluşturulurken bir hata oluştu");
        },
    });
}

export const useUpdateLanguage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, language}: {id: number, language: LanguageRequest}) => updateLanguage(id, language),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["languages"] });
            queryClient.invalidateQueries({ queryKey: ["language", id] });
            toast.success("Dil başarıyla güncellendi");
        },
        onError: () => {
            toast.error("Dil güncellenirken bir hata oluştu");
        },
    });
}

export const useDeleteLanguage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteLanguage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["languages"] });
            toast.success("Dil başarıyla silindi");
        },
        onError: () => {
            toast.error("Dil silinirken bir hata oluştu");
        },
    });
}

export const useLanguageById = (id: number) => {
    return useAuthQuery<LanguageResponse>({
        queryKey: ["language", id],
        queryFn: () => getLanguageById(id),
        enabled: !Number.isNaN(id) && id > 0,
    });
}