import { fetchClient } from "@/utils/fetch-client";
import type { ComponentRequest, ComponentResponse } from "@/types/components.types";
import type { Page } from "@/types/pagination.types";
import type { AssetRequest } from "@/types/assets.types";

export const getComponents = (search: string, page: number, size: number, sort: string): Promise<Page<ComponentResponse>> => {
	return fetchClient<void, Page<ComponentResponse>>(`/admin/components?search=${encodeURIComponent(search)}&page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`, {
		method: "GET",
	});
};

export const createComponent = (request: ComponentRequest): Promise<ComponentResponse> => {
	return fetchClient<ComponentRequest, ComponentResponse>("/admin/components", {
		method: "POST",
		body: request,
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
};

export const updateComponent = (id: number, request: ComponentRequest): Promise<ComponentResponse> => {
	return fetchClient<ComponentRequest, ComponentResponse>(`/admin/components/${id}`, {
		method: "PUT",
		body: request,
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
};

export const deleteComponent = (id: number): Promise<void> => {
	return fetchClient<void, void>(`/admin/components/${id}`, {
		method: "DELETE",
	});
};

export const getComponentById = (id: number): Promise<ComponentResponse> => {
	return fetchClient<void, ComponentResponse>(`/admin/components/${id}`, {
		method: "GET",
	});
};

export const createComponentAsset = (id: number, request: AssetRequest): Promise<ComponentResponse> => {
	return fetchClient<AssetRequest, ComponentResponse>(`/admin/components/${id}/assets`, {
		method: "POST",
		body: request,
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
};

export const updateComponentAsset = (id: number, assetId: number, request: AssetRequest): Promise<ComponentResponse> => {
	return fetchClient<AssetRequest, ComponentResponse>(`/admin/components/${id}/assets/${assetId}`, {
		method: "PUT",
		body: request,
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
};

export const deleteComponentAsset = (id: number, assetId: number): Promise<void> => {
	return fetchClient<void, void>(`/admin/components/${id}/assets/${assetId}`, {
		method: "DELETE",
	});
};
