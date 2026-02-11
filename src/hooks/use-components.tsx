import type { AssetRequest } from "@/types/assets.types";
import { useAuthQuery } from "./use-auth-query";
import { getComponents, createComponent, updateComponent, deleteComponent, getComponentById, createComponentAsset, updateComponentAsset, deleteComponentAsset } from "@/services/components-service";
import type { ComponentRequest, ComponentResponse } from "@/types/components.types";
import type { Page } from "@/types/pagination.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useComponents = (search: string, page: number, size: number, sort: string) => {
    return useAuthQuery<Page<ComponentResponse>>({
        queryKey: ["components", search, page, size, sort],
        queryFn: () => getComponents(search, page, size, sort),
    });
}

export const useCreateComponent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: ComponentRequest) => createComponent(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["components"] });
            toast.success("Bileşen başarıyla oluşturuldu");
        },
        onError: () => {
            toast.error("Bileşen oluşturulurken bir hata oluştu");
        },
    });
}

export const useUpdateComponent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, request}: {id: number, request: ComponentRequest}) => updateComponent(id, request),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["components"] });
            queryClient.invalidateQueries({ queryKey: ["component", variables.id] });
            toast.success("Bileşen başarıyla güncellendi");
        },
        onError: () => {
            toast.error("Bileşen güncellenirken bir hata oluştu");
        },
    });
}

export const useDeleteComponent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteComponent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["components"] });
            toast.success("Bileşen başarıyla silindi");
        },
        onError: () => {
            toast.error("Bileşen silinirken bir hata oluştu");
        },
    });
}

export const useComponentById = (id: number) => {
    return useAuthQuery<ComponentResponse>({
        queryKey: ["component", id],
        queryFn: () => getComponentById(id),
        enabled: !Number.isNaN(id) && id > 0,
    });
}

export const useCreateComponentAsset = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, request}: {id: number, request: AssetRequest}) => createComponentAsset(id, request),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["components"] });
            queryClient.invalidateQueries({ queryKey: ["component", variables.id] });
            toast.success("Medya başarıyla eklendi");
        },
        onError: () => {
            toast.error("Bileşen asseti oluşturulurken bir hata oluştu");
        },
    });
}

export const useUpdateComponentAsset = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, assetId, request}: {id: number, assetId: number, request: AssetRequest}) => updateComponentAsset(id, assetId, request),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["components"] });
            queryClient.invalidateQueries({ queryKey: ["component", variables.id] });
            toast.success("Medya başarıyla güncellendi");
        },
        onError: () => {
            toast.error("Bileşen asseti güncellenirken bir hata oluştu");
        },
    });
}

export const useDeleteComponentAsset = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, assetId}: {id: number, assetId: number}) => deleteComponentAsset(id, assetId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["components"] });
            queryClient.invalidateQueries({ queryKey: ["component", variables.id] });
            toast.success("Medya başarıyla silindi");
        },
        onError: () => {
            toast.error("Bileşen asseti silinirken bir hata oluştu");
        },
    });
}