export interface ComponentTypeRequest {
    type: string;
    hasTitle: boolean;
    hasExcerpt: boolean;
    hasDescription: boolean;
    hasImage: boolean;
    hasValue: boolean;
    hasAsset: boolean;
    photo: string|File;
    hasLink: boolean;

}

export interface ComponentTypeResponse {
    id: number;
    type: string;
    hasTitle: boolean;
    hasExcerpt: boolean;
    hasDescription: boolean;
    hasImage: boolean;
    hasValue: boolean;
    hasAsset: boolean;
    photo: string;
    hasLink: boolean;

}