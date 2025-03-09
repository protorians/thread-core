export interface IProjectAssets {
    "fonts": string;
    "icons": string;
    "css": string;
    "images": string;
    "sounds": string;
    "videos": string;
}

export interface IProjectResource {
    icons: string[];
}

export interface IProjectConfig {
    source: string;
    assets?: Partial<IProjectAssets>;
    resources?: Partial<IProjectResource>;
}
