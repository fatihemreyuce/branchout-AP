import { useAuthQuery } from "./use-auth-query";
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember, getTeamMemberById } from "@/services/team-members-service";
import type { TeamMemberRequest, TeamMemberResponse } from "@/types/team.members.types";
import type { Page } from "@/types/pagination.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useTeamMembers = (search: string, page: number, size: number, sort: string) => {
    return useAuthQuery<Page<TeamMemberResponse>>({
        queryKey: ["team-members", search, page, size, sort],
        queryFn: () => getTeamMembers(search, page, size, sort),
    });
}

export const useCreateTeamMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: TeamMemberRequest) => createTeamMember(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
            toast.success("Team Member başarıyla oluşturuldu");
        },
        onError: () => {
            toast.error("Team Member oluşturulurken bir hata oluştu");
        },
    });
}

export const useUpdateTeamMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, request}: {id: number, request: TeamMemberRequest}) => updateTeamMember(id, request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
            toast.success("Team Member başarıyla güncellendi");
        },
        onError: () => {
            toast.error("Team Member güncellenirken bir hata oluştu");
        },
    });
}

export const useDeleteTeamMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteTeamMember(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
            toast.success("Team Member başarıyla silindi");
        },
        onError: () => {
            toast.error("Team Member silinirken bir hata oluştu");
        },
    });
}

export const useTeamMemberById = (id: number) => {
    return useAuthQuery<TeamMemberResponse>({
        queryKey: ["team-member", id],
        queryFn: () => getTeamMemberById(id),
    });
}
