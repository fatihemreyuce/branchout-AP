import type { AssetResponse } from "./assets.types";
import type { ComponentTypeResponse } from "./components.type.types";

export interface localizations{
    languageCode: string;
    title: string;
    excerpt: string;
    description: string;
}

export interface assets{
    id: number;
    asset: AssetResponse[];
    sortOrder: number;

    assetId?: number;

    asset_id?: number;
}

export interface ComponentRequest {
    name: string;
    typeId: number;
    value: string;
    localizations: localizations[];
    assets: assets[];
    link: string;
}

export interface ComponentResponse {
    id: number;
    name: string;
    type: ComponentTypeResponse;
    typeId: number;
    value: string;
    localizations: localizations[];
    assets: assets[];
    link: string;
}