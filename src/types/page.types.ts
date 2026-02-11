import type { PageTypeResponse } from "./page.type.types";
import type {ComponentResponse} from "./components.types";
import type { TeamMemberResponse } from "./team.members.types";

export interface fileAssetLocalizations {
    languageCode: string;
    title: string;
    description: string;
    subdescription: string;
}

export interface imageAssetLocalizations {
    languageCode: string;
    title: string;
    description: string;
    subdescription: string;
}

export interface localizations {
    languageCode: string;
    title: string;
    excerpt: string;
    content: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
}

export interface PageRequest {
    slug: string;
    name: string;
    typeId: number;
    fileAsset: string|File;
    fileAssetId: number;
    fileAssetLocalizations: fileAssetLocalizations[];
    imageAsset: string|File;
    imageAssetId: number;
    imageAssetLocalizations: imageAssetLocalizations[];
    localizations: localizations[];
}

export interface PageResponse {
    id: number;
    slug: string;
    name: string;
    type: PageTypeResponse;
    typeId: number;
    file:{
        id: number;
        url: string;
        type: string;
        mime: string;
        width: number;
        height: number;
        localizations: fileAssetLocalizations[];
    };
    image:{
        id: number;
        url: string;
        type: string;
        mime: string;
        width: number;
        height: number;
        localizations: imageAssetLocalizations[];
    };
    localizations: localizations[];
    components: ComponentResponse[];
    teamMembers: TeamMemberResponse[];
    createdAt: string;
    updatedAt: string;
}