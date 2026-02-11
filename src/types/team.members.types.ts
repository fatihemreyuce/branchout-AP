export interface localizations{
    languageCode: string;
    title: string;
    description: string;
}

export interface TeamMemberRequest {
    name: string;
    linkedinUrl: string;
    email: string;
    photo: string|File;
    localizations: localizations[];
}

export interface TeamMemberResponse {
    id: number;
    name: string;
    linkedinUrl: string;
    email: string;
    photo: string;
    localizations: localizations[];
    sortOrder: number;
}