import { fetchClient } from "@/utils/fetch-client";
import type { LanguageRequest, LanguageResponse } from "@/types/languages.types";
import type { Page } from "@/types/pagination.types";

export function getLanguages(
	page: number,
	size: number,
	sort: string
): Promise<Page<LanguageResponse>> {
	return fetchClient<void, Page<LanguageResponse>>(
		`/admin/languages?page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`,
		{ method: "GET" }
	);
}

export function createLanguage(request: LanguageRequest): Promise<LanguageResponse> {
	return fetchClient<LanguageRequest, LanguageResponse>("/admin/languages", {
		method: "POST",
		body: request,
	});
}

export function updateLanguage(
	id: number,
	request: LanguageRequest
): Promise<LanguageResponse> {
	return fetchClient<LanguageRequest, LanguageResponse>(`/admin/languages/${id}`, {
		method: "PUT",
		body: request,
	});
}

export function deleteLanguage(id: number): Promise<void> {
	return fetchClient<void, void>(`/admin/languages/${id}`, {
		method: "DELETE",
	});
}

export function getLanguageById(id: number): Promise<LanguageResponse> {
	return fetchClient<void, LanguageResponse>(`/admin/languages/${id}`, {
		method: "GET",
	});
}
