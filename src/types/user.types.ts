export interface UserRequest {
    username: string;
    email: string;
    password: string;
}

/** Payload for update: UserRequest + id (id used in URL, not necessarily in body) */
export type UserUpdatePayload = UserRequest & { id: number };

export interface UserResponse {
    id: number;
    username: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}