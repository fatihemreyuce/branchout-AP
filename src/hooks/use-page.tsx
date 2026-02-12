import { useAuthQuery } from "./use-auth-query";
import { getPages, getPageById, createPage, updatePage, deletePage, createPageTeamMember, addTeamMemberToPage, updatePageTeamMember, deletePageTeamMember, createPageComponent, addComponentToPage, updatePageComponent, deletePageComponent, createPageDuplicate, createPageBulkDuplicate, deletePageBulk } from "@/services/page-service";
import type { ComponentRequest } from "@/types/components.types";
import type { PageRequest, PageResponse } from "@/types/page.types";
import type { Page } from "@/types/pagination.types";
import type { TeamMemberRequest } from "@/types/team.members.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const usePages = (search: string, page: number, size: number, sort: string) => {
    return useAuthQuery<Page<PageResponse>>({
        queryKey: ["pages", search, page, size, sort],
        queryFn: () => getPages(search, page, size, sort),
    });
}

export const usePageById = (id: number) => {
    return useAuthQuery<PageResponse>({
        queryKey: ["page", id],
        queryFn: () => getPageById(id),
    });
}

export const useCreatePage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createPage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            toast.success("Sayfa başarıyla oluşturuldu");
        },
        onError: () => {
            toast.error("Sayfa oluşturulurken bir hata oluştu");
        },
    });
}

export const useUpdatePage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, page }: { id: number; page: PageRequest }) => updatePage(id, page),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            toast.success("Sayfa başarıyla güncellendi");
        },
        onError: () => {
            toast.error("Sayfa güncellenirken bir hata oluştu");
        },
    });
}

export const useDeletePage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deletePage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            toast.success("Sayfa başarıyla silindi");
        },
        onError: () => {
            toast.error("Sayfa silinirken bir hata oluştu");
        },
    });
}

export const useCreatePageTeamMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, teamMember }: { id: number; teamMember: TeamMemberRequest }) => createPageTeamMember(id, teamMember),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            toast.success("Team Member başarıyla oluşturuldu");
        },
        onError: () => {
            toast.error("Team Member oluşturulurken bir hata oluştu");
        },
    });
}

export const useAddTeamMemberToPage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ pageId, teamMemberId, sortOrder }: { pageId: number; teamMemberId: number; sortOrder?: number }) => addTeamMemberToPage(pageId, teamMemberId, sortOrder),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            toast.success("Takım üyesi sayfaya eklendi");
        },
        onError: () => {
            toast.error("Takım üyesi eklenirken bir hata oluştu");
        },
    });
}

export const useUpdatePageTeamMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, teamMember }: { id: number; teamMember: TeamMemberRequest }) => updatePageTeamMember(id, teamMember),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            toast.success("Team Member başarıyla güncellendi");
        },
        onError: () => {
            toast.error("Team Member güncellenirken bir hata oluştu");
        },
    });
}

export const useDeletePageTeamMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, teamMemberId }: { id: number; teamMemberId: number }) => deletePageTeamMember(id, teamMemberId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            toast.success("Team Member başarıyla silindi");
        },
        onError: () => {
            toast.error("Team Member silinirken bir hata oluştu");
        },
    });
}

export const useCreatePageComponent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, component }: { id: number; component: ComponentRequest }) => createPageComponent(id, component),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            toast.success("Bileşen başarıyla oluşturuldu");
        },
        onError: () => {
            toast.error("Bileşen oluşturulurken bir hata oluştu");
        },
    });
}

export const useAddComponentToPage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ pageId, componentId, sortOrder }: { pageId: number; componentId: number; sortOrder?: number }) => addComponentToPage(pageId, componentId, sortOrder),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            toast.success("Bileşen sayfaya eklendi");
        },
        onError: () => {
            toast.error("Bileşen eklenirken bir hata oluştu");
        },
    });
}


export const useUpdatePageComponent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, componentId, component }: { id: number; componentId: number; component: ComponentRequest }) => updatePageComponent(id, componentId, component),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            toast.success("Bileşen başarıyla güncellendi");
        },
        onError: () => {
            toast.error("Bileşen güncellenirken bir hata oluştu");
        },
    });
}

export const useDeletePageComponent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, componentId }: { id: number; componentId: number }) => deletePageComponent(id, componentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            toast.success("Bileşen başarıyla silindi");
        },
        onError: () => {
            toast.error("Bileşen silinirken bir hata oluştu");
        },
    });
}

export const useCreatePageDuplicate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => createPageDuplicate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            toast.success("Sayfa başarıyla kopyalandı");
        },
        onError: () => {
            toast.error("Sayfa kopyalanırken bir hata oluştu");
        },
    });
}

export const useCreatePageBulkDuplicate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (ids: number[]) => createPageBulkDuplicate(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            toast.success("Sayfalar başarıyla kopyalandı");
        },
        onError: () => {
            toast.error("Sayfalar kopyalanırken bir hata oluştu");
        },
    });
}

export const useDeletePageBulk = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (ids: number[]) => deletePageBulk(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            toast.success("Sayfalar başarıyla silindi");
        },
        onError: () => {
            toast.error("Sayfalar silinirken bir hata oluştu");
        },
    });
}