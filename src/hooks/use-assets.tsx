import { useAuthQuery } from "./use-auth-query";
import { getAssets, createAsset, updateAsset, deleteAsset, getAssetById } from "@/services/assets-service";
import type { AssetRequest, AssetResponse } from "@/types/assets.types";
import type { Page } from "@/types/pagination.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAssets = (search: string, page: number, size: number, sort: string) => {
	return useAuthQuery<Page<AssetResponse>>({
		queryKey: ["assets", search, page, size, sort],
		queryFn: () => getAssets(search, page, size, sort),
	});
};

export const useCreateAsset = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (request: AssetRequest) => createAsset(request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["assets"] });
			toast.success("Asset başarıyla oluşturuldu");
		},
		onError: () => {
			toast.error("Asset oluşturulurken bir hata oluştu");
		},
	});
};

export const useUpdateAsset = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, request }: { id: number; request: AssetRequest }) => updateAsset(id, request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["assets"] });
			toast.success("Asset başarıyla güncellendi");
		},
		onError: () => {
			toast.error("Asset güncellenirken bir hata oluştu");
		},
	});
};

export const useDeleteAsset = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => deleteAsset(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["assets"] });
			toast.success("Asset başarıyla silindi");
		},
		onError: () => {
			toast.error("Asset silinirken bir hata oluştu");
		},
	});
};

export const useAssetById = (id: number) => {
	return useAuthQuery<AssetResponse>({
		queryKey: ["asset", id],
		queryFn: () => getAssetById(id),
	});
};
