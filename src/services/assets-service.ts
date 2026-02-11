import { fetchClient } from "@/utils/fetch-client";
import type { AssetRequest, AssetResponse } from "@/types/assets.types";
import type { Page } from "@/types/pagination.types";

export function getAssets(
	search: string,
	page: number,
	size: number,
	sort: string
): Promise<Page<AssetResponse>> {
	return fetchClient<void, Page<AssetResponse>>(
		`/admin/assets?search=${encodeURIComponent(search)}&page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`,
		{ method: "GET" }
	);
}

export function createAsset(request: AssetRequest): Promise<AssetResponse> {
	return fetchClient<AssetRequest, AssetResponse>("/admin/assets", {
		method: "POST",
		body: request,
		headers: { "Content-Type": "multipart/form-data" },
	});
}

export function updateAsset(id: number, request: AssetRequest): Promise<AssetResponse> {
	return fetchClient<AssetRequest, AssetResponse>(`/admin/assets/${id}`, {
		method: "PUT",
		body: request,
		headers: { "Content-Type": "multipart/form-data" },
	});
}

export function deleteAsset(id: number): Promise<void> {
	return fetchClient<void, void>(`/admin/assets/${id}`, { method: "DELETE" });
}

export function getAssetById(id: number): Promise<AssetResponse> {
	return fetchClient<void, AssetResponse>(`/admin/assets/${id}`, { method: "GET" });
}
