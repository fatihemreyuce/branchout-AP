import { fetchClient } from "@/utils/fetch-client";
import type { PartnerRequest, PartnerResponse } from "@/types/partners.types";
import type { Page } from "@/types/pagination.types";

export function getPartners(): Promise<Page<PartnerResponse>> {
	return fetchClient<void, Page<PartnerResponse>>(`/admin/partners`, {
		method: "GET",
	});
}

export function createPartner(request: PartnerRequest): Promise<PartnerResponse> {
	return fetchClient<PartnerRequest, PartnerResponse>("/admin/partners", {
		method: "POST",
		body: request,
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
}

export function updatePartner(id: number, request: PartnerRequest): Promise<PartnerResponse> {
	return fetchClient<PartnerRequest, PartnerResponse>(`/admin/partners/${id}`, {
		method: "PUT",
		body: request,
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
}

export function deletePartner(id: number): Promise<void> {
	return fetchClient<void, void>(`/admin/partners/${id}`, {
		method: "DELETE",
	});
}

export function getPartnerById(id: number): Promise<PartnerResponse> {
	return fetchClient<void, PartnerResponse>(`/admin/partners/${id}`, {
		method: "GET",
	});
}
