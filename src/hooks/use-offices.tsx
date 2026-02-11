import { useAuthQuery } from "@/hooks/use-auth-query";
import { getOffices, createOffice, updateOffice, deleteOffice, getOfficeById } from "@/services/offices-service";
import type { OfficeRequest, OfficeResponse } from "@/types/offices.types";
import type { Page } from "@/types/pagination.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useOffices = (search: string, page: number, size: number, sort: string) => {
    return useAuthQuery<Page<OfficeResponse>>({
        queryKey: ["offices", search, page, size, sort],
        queryFn: () => getOffices(search, page, size, sort),
    });
}

export const useCreateOffice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (office: OfficeRequest) => createOffice(office),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["offices"] });
            toast.success("Ofis başarıyla oluşturuldu");
        },
        onError: () => {
            toast.error("Ofis oluşturulurken bir hata oluştu");
        },
    });
}

export const useUpdateOffice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, office}: {id: number, office: OfficeRequest}) => updateOffice(id, office),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["offices"] });
            queryClient.invalidateQueries({ queryKey: ["office", id] });
            toast.success("Ofis başarıyla güncellendi");
        },
        onError: () => {
            toast.error("Ofis güncellenirken bir hata oluştu");
        },
    });
}

export const useDeleteOffice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteOffice(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["offices"] });
            toast.success("Ofis başarıyla silindi");
        },
        onError: () => {
            toast.error("Ofis silinirken bir hata oluştu");
        },
    });
}

export const useGetOffice = (id: number) => {
    return useAuthQuery<OfficeResponse>({
        queryKey: ["office", id],
        queryFn: () => getOfficeById(id),
        enabled: !Number.isNaN(id) && id > 0,
    });
}