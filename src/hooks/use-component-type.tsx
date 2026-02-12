import { useAuthQuery } from "./use-auth-query";
import {
	getComponentTypes,
	createComponentType,
	updateComponentType,
	deleteComponentType,
	getComponentTypeById,
} from "@/services/component-type-service";
import type { ComponentTypeRequest, ComponentTypeResponse } from "@/types/components.type.types";
import type { Page } from "@/types/pagination.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useComponentTypes = (search: string, page: number, size: number, sort: string) => {
	return useAuthQuery<Page<ComponentTypeResponse>>({
		queryKey: ["component-types", search, page, size, sort],
		queryFn: () => getComponentTypes(search, page, size, sort),
	});
};

export const useCreateComponentType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (request: ComponentTypeRequest) => createComponentType(request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["component-types"] });
			toast.success("Bileşen tipi başarıyla oluşturuldu");
		},
		onError: () => {
			toast.error("Bileşen tipi oluşturulurken bir hata oluştu");
		},
	});
};

export const useUpdateComponentType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, request }: { id: number; request: ComponentTypeRequest }) =>
			updateComponentType(id, request),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: ["component-types"] });
			queryClient.invalidateQueries({ queryKey: ["component-type", variables.id] });
			toast.success("Bileşen tipi başarıyla güncellendi");
		},
		onError: () => {
			toast.error("Bileşen tipi güncellenirken bir hata oluştu");
		},
	});
};

export const useDeleteComponentType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => deleteComponentType(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["component-types"] });
			toast.success("Bileşen tipi başarıyla silindi");
		},
		onError: () => {
			toast.error("Bileşen tipi silinirken bir hata oluştu");
		},
	});
};

export const useComponentTypeById = (id: number) => {
	return useAuthQuery<ComponentTypeResponse>({
		queryKey: ["component-type", id],
		queryFn: () => getComponentTypeById(id),
		enabled: id > 0,
	});
};
