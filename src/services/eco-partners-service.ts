import { fetchClient } from "@/utils/fetch-client";
import type { EcoPartnerRequest, EcoPartnerResponse } from "@/types/eco.partners.types";
import type { Page } from "@/types/pagination.types";

export function getEcoPartners(): Promise<Page<EcoPartnerResponse>> {
    return fetchClient<void, Page<EcoPartnerResponse>>(`/admin/eco-partners`, {
        method: "GET",
    });
}

export function createEcoPartner(request: EcoPartnerRequest): Promise<EcoPartnerResponse> {
    return fetchClient<EcoPartnerRequest, EcoPartnerResponse>("/admin/eco-partners", {
        method: "POST",
        body: request,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export function updateEcoPartner(id: number, request: EcoPartnerRequest): Promise<EcoPartnerResponse> {
    return fetchClient<EcoPartnerRequest, EcoPartnerResponse>(`/admin/eco-partners/${id}`, {
        method: "PUT",
        body: request,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export function deleteEcoPartner(id: number): Promise<void> {
    return fetchClient<void, void>(`/admin/eco-partners/${id}`, {
        method: "DELETE",
    });
}

export function getEcoPartnerById(id: number): Promise<EcoPartnerResponse> {
    return fetchClient<void, EcoPartnerResponse>(`/admin/eco-partners/${id}`, {
        method: "GET",
    });
}