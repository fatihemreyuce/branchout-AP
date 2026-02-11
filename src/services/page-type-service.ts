import { fetchClient } from "@/utils/fetch-client";
import type { PageTypeRequest, PageTypeResponse } from "@/types/page.type.types";
import type { Page } from "@/types/pagination.types";

export function getPageTypes(search: string, page: number, size: number, sort: string): Promise<Page<PageTypeResponse>> {
    return fetchClient<void, Page<PageTypeResponse>>(`/admin/page-types?search=${search}&page=${page}&size=${size}&sort=${sort}`, {
        method: "GET",
    });
}

export function createPageType(pageType: PageTypeRequest): Promise<PageTypeResponse> {
    return fetchClient<PageTypeRequest, PageTypeResponse>("/admin/page-types", {
        method: "POST",
        body: pageType,
    });
}

export function updatePageType(id: number, pageType: PageTypeRequest): Promise<PageTypeResponse> {
    return fetchClient<PageTypeRequest, PageTypeResponse>(`/admin/page-types/${id}`, {
        method: "PUT",
        body: pageType,
    });
}

export function deletePageType(id: number): Promise<void> {
    return fetchClient<void, void>(`/admin/page-types/${id}`, {
        method: "DELETE",
    });
}

export function getPageTypeById(id: number): Promise<PageTypeResponse> {
    return fetchClient<void, PageTypeResponse>(`/admin/page-types/${id}`, {
        method: "GET",
    });
}