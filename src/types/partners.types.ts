export interface PartnerRequest {
    logo: string|File;
    orderIndex: number;
}

export interface PartnerResponse {
    id: number;
    logo: string;
    orderIndex: number;
}