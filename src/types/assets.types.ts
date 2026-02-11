/** Backend AssetType enum: IMAGE, FILE, VIDEO */
export const ASSET_TYPE_OPTIONS = [
	{ value: "IMAGE", label: "Görsel" },
	{ value: "FILE", label: "Dosya" },
	{ value: "VIDEO", label: "Video" },
] as const;

export interface localizations{
    languageCode: string;
    title: string;
    description: string;
    subdescription: string;
}


export interface AssetRequest {
    file: string|File;
    type: string;
    localizations: localizations[];
}

export interface AssetResponse {
    id: number;
    url: string;
    type: string;
    mime: string;
    width: number;
    height: number;
    localizations: localizations[];
}