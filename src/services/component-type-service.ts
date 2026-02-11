import { fetchClient } from "@/utils/fetch-client";
import type { ComponentTypeRequest, ComponentTypeResponse } from "@/types/components.type.types";
import type { Page } from "@/types/pagination.types";

/** Backend response'ta hasAssets (s'li) dönüyor; istekte de aynı key bekleniyor */
function requestToFormBody(req: ComponentTypeRequest): Record<string, unknown> {
	return {
		...req,
		has_title: req.hasTitle,
		has_excerpt: req.hasExcerpt,
		has_description: req.hasDescription,
		has_image: req.hasImage,
		has_value: req.hasValue,
		has_asset: req.hasAsset,
		hasAssets: req.hasAsset,
		has_kind: req.hasKind,
	};
}

export function getComponentTypes(
	search: string,
	page: number,
	size: number,
	sort: string
): Promise<Page<ComponentTypeResponse>> {
	return fetchClient<void, Page<ComponentTypeResponse>>(
		`/admin/component-types?search=${encodeURIComponent(search)}&page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`,
		{ method: "GET" }
	);
}

export function createComponentType(request: ComponentTypeRequest): Promise<ComponentTypeResponse> {
	return fetchClient<Record<string, unknown>, ComponentTypeResponse>("/admin/component-types", {
		method: "POST",
		body: requestToFormBody(request),
		headers: { "Content-Type": "multipart/form-data" },
	});
}

export function updateComponentType(
	id: number,
	request: ComponentTypeRequest
): Promise<ComponentTypeResponse> {
	return fetchClient<Record<string, unknown>, ComponentTypeResponse>(
		`/admin/component-types/${id}`,
		{
			method: "PUT",
			body: requestToFormBody(request),
			headers: { "Content-Type": "multipart/form-data" },
		}
	);
}

export function deleteComponentType(id: number): Promise<void> {
	return fetchClient<void, void>(`/admin/component-types/${id}`, { method: "DELETE" });
}

export function getComponentTypeById(id: number): Promise<ComponentTypeResponse> {
	return fetchClient<void, ComponentTypeResponse>(`/admin/component-types/${id}`, {
		method: "GET",
	});
}
