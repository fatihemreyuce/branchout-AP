export interface EcoPartnerRequest {
    logo: string|File;
    orderIndex: number;
}

export interface EcoPartnerResponse {
    id: number;
    logo: string;
    orderIndex: number;
}