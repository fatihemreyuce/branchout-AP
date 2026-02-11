import {useAuthQuery} from "@/hooks/use-auth-query";
import { getUsers, createUser, updateUser, deleteUser, getUserById } from "@/services/user-service";
import type { Page } from "@/types/pagination.types";
import type { UserRequest, UserResponse, UserUpdatePayload } from "@/types/user.types";
import {  useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUsersQuery = (search: string, page: number, size: number, sort: string) => {
    return useAuthQuery<Page<UserResponse>>({
        queryKey: ["users", search, page, size, sort],
        queryFn: () => getUsers(search, page, size, sort),
    });
}


export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (user: UserRequest) => createUser(user),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("Kullanıcı başarıyla oluşturuldu");
        },
        onError: () => {
            toast.error("Kullanıcı oluşturulurken bir hata oluştu");
        },
    });
}

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (user: UserUpdatePayload) => updateUser(user.id, user),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
            toast.success("Kullanıcı başarıyla güncellendi");
        },
        onError: () => {
            toast.error("Kullanıcı güncellenirken bir hata oluştu");
        },
    });
}

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("Kullanıcı başarıyla silindi");
        },
        onError: () => {
            toast.error("Kullanıcı silinirken bir hata oluştu");
        },
    });
}

export const useUserById = (id: number) => {
    return useAuthQuery<UserResponse>({
        queryKey: ["user", id],
        queryFn: () => getUserById(id),
        enabled: !Number.isNaN(id) && id > 0,
    });
}