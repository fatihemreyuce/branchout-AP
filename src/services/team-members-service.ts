import { fetchClient } from "@/utils/fetch-client";
import type { TeamMemberRequest, TeamMemberResponse } from "@/types/team.members.types";
import type { Page } from "@/types/pagination.types";

export function getTeamMembers(search: string, page: number, size: number, sort: string): Promise<Page<TeamMemberResponse>> {
    return fetchClient<void, Page<TeamMemberResponse>>(`/admin/team-members?search=${encodeURIComponent(search)}&page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`, {
        method: "GET",
    });
}

export function createTeamMember(request: TeamMemberRequest): Promise<TeamMemberResponse> {
    return fetchClient<TeamMemberRequest, TeamMemberResponse>("/admin/team-members", {
        method: "POST",
        body: request,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export function updateTeamMember(id: number, request: TeamMemberRequest): Promise<TeamMemberResponse> {
    return fetchClient<TeamMemberRequest, TeamMemberResponse>(`/admin/team-members/${id}`, {
        method: "PUT",
        body: request,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export function deleteTeamMember(id: number): Promise<void> {
    return fetchClient<void, void>(`/admin/team-members/${id}`, {
        method: "DELETE",
    });
}

export function getTeamMemberById(id: number): Promise<TeamMemberResponse> {
    return fetchClient<void, TeamMemberResponse>(`/admin/team-members/${id}`, {
        method: "GET",
    });
}
