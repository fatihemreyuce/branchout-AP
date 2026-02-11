import { fetchClient } from "@/utils/fetch-client";
import type { OfficeRequest, OfficeResponse } from "@/types/offices.types";
import type { Page } from "@/types/pagination.types";

export function getOffices(
	search: string,
	page: number,
	size: number,
	sort: string
): Promise<Page<OfficeResponse>> {
	return fetchClient<void, Page<OfficeResponse>>(
		`/admin/offices?search=${encodeURIComponent(search)}&page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`,
		{ method: "GET" }
	);
}

export function createOffice(request: OfficeRequest): Promise<OfficeResponse> {
	return fetchClient<OfficeRequest, OfficeResponse>("/admin/offices", {
		method: "POST",
		body: request,
	});
}

export function updateOffice(
	id: number,
	request: OfficeRequest
): Promise<OfficeResponse> {
	return fetchClient<OfficeRequest, OfficeResponse>(`/admin/offices/${id}`, {
		method: "PUT",
		body: request,
	});
}

export function deleteOffice(id: number): Promise<void> {
	return fetchClient<void, void>(`/admin/offices/${id}`, {
		method: "DELETE",
	});
}

export function getOfficeById(id: number): Promise<OfficeResponse> {
	return fetchClient<void, OfficeResponse>(`/admin/offices/${id}`, {
		method: "GET",
	});
}
