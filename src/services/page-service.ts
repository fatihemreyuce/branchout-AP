import { fetchClient } from "@/utils/fetch-client";
import type { PageRequest, PageResponse } from "@/types/page.types";
import type { Page } from "@/types/pagination.types";
import type { TeamMemberRequest, TeamMemberResponse } from "@/types/team.members.types";
import type { ComponentRequest, ComponentResponse } from "@/types/components.types";

export function getPages(search: string, page: number, size: number, sort: string): Promise<Page<PageResponse>> {
    return fetchClient<void, Page<PageResponse>>(`/admin/pages?search=${encodeURIComponent(search)}&page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`, {
        method: "GET",
    });
}

export function getPageById(id: number): Promise<PageResponse> {
    return fetchClient<void, PageResponse>(`/admin/pages/${id}`, {
        method: "GET",
    });
}

export function createPage(page: PageRequest): Promise<PageResponse> {
    return fetchClient<PageRequest, PageResponse>("/admin/pages", {
        method: "POST",
        body: page,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export function updatePage(id: number, page: PageRequest): Promise<PageResponse> {
    return fetchClient<PageRequest, PageResponse>(`/admin/pages/${id}`, {
        method: "PUT",
        body: page,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export function deletePage(id: number): Promise<void> {
    return fetchClient<void, void>(`/admin/pages/${id}`, {
        method: "DELETE",
    });
}

export function createPageTeamMember(id: number, teamMember: TeamMemberRequest): Promise<TeamMemberResponse> {
    return fetchClient<TeamMemberRequest, TeamMemberResponse>(`/admin/pages/${id}/team-members`, {
        method: "POST",
        body: teamMember,
    });
}

/** Mevcut takım üyesini sayfaya ekler - backend teamMemberId ve isteğe bağlı sortOrder bekler */
export function addTeamMemberToPage(pageId: number, teamMemberId: number, sortOrder?: number): Promise<TeamMemberResponse> {
    return fetchClient<{ teamMemberId: number; sortOrder?: number }, TeamMemberResponse>(`/admin/pages/${pageId}/team-members`, {
        method: "POST",
        body: { teamMemberId, ...(sortOrder != null && { sortOrder }) },
    });
}

export function updatePageTeamMember(id: number, teamMember: TeamMemberRequest): Promise<TeamMemberResponse> {
    return fetchClient<TeamMemberRequest, TeamMemberResponse>(`/admin/pages/${id}/team-members`, {
        method: "PUT",
        body: teamMember,
    });
}

export function deletePageTeamMember(id: number, teamMemberId: number): Promise<void> {
    return fetchClient<void, void>(`/admin/pages/${id}/team-members/${teamMemberId}`, {
        method: "DELETE",
    });
}

export function createPageComponent(id: number, component: ComponentRequest): Promise<ComponentResponse> {
    return fetchClient<ComponentRequest, ComponentResponse>(`/admin/pages/${id}/components`, {
        method: "POST",
        body: component,
    });
}

/** Mevcut bileşeni sayfaya ekler - backend componentId ve isteğe bağlı sortOrder bekler */
export function addComponentToPage(pageId: number, componentId: number, sortOrder?: number): Promise<ComponentResponse> {
    return fetchClient<{ componentId: number; sortOrder?: number }, ComponentResponse>(`/admin/pages/${pageId}/components`, {
        method: "POST",
        body: { componentId, ...(sortOrder != null && { sortOrder }) },
    });
}

export function updatePageComponent(id: number, componentId: number, component: ComponentRequest): Promise<ComponentResponse> {
    return fetchClient<ComponentRequest, ComponentResponse>(`/admin/pages/${id}/components/${componentId}`, {
        method: "PUT",
        body: component,
    });
}

export function deletePageComponent(id: number, componentId: number): Promise<void> {
    return fetchClient<void, void>(`/admin/pages/${id}/components/${componentId}`, {
        method: "DELETE",
    });
}

export function createPageDuplicate(id: number): Promise<PageResponse> {
    return fetchClient<void, PageResponse>(`/admin/pages/${id}/duplicate`, {
        method: "POST",
    });
}

export function createPageBulkDuplicate(ids: number[]): Promise<PageResponse[]> {
    return fetchClient<number[], PageResponse[]>(`/admin/pages/bulk-duplicate`, {
        method: "POST",
        body: ids,
    });
}

export function deletePageBulk(ids: number[]): Promise<void> {
    return fetchClient<number[], void>(`/admin/pages/bulk-delete`, {
        method: "POST",
        body: ids,
    });
}