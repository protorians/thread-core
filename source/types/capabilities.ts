import {ISignalStack} from "@protorians/core";

export type ICapabilityScheme = {
    meta: ICapabilityMeta;
    payload: ICapabilityPayloads
}

export type ICapabilityMeta = ICapabilityDumperConfig & {
    timestamp: number;
}

export type ICapabilityContext = {
    instance: ICapabilityDumper;
    data: ICapabilityPayload
}

export type ICapabilityPayload = {
    name: string;
    file: string;
}

export type ICapabilityConfig = {
    slug: string;
    name: string;
    description?: string;
    workdir?: string;
    command: string;
    options?: string[][];
    arguments?: string[][];
    files?: string[];
}

export type ICapabilityPayloads = {
    [K: string]: ICapabilityConfig
}

export type ICapabilityDumperConfig = {
    directory: string;
    prebuild: boolean;
    output: string;
    allow: (string | RegExp)[];
    silent: boolean;
}

export interface ICapabilityDumperSignalMap {
    commit: ICapabilityContext;
    commits: {
        name: string;
        instance: ICapabilityDumper;
        files: string[]
    };
}

export interface ICapabilityDumper {

    readonly signal: ISignalStack<ICapabilityDumperSignalMap>

    readonly config: ICapabilityDumperConfig;

    commit(name: string, file: string): ICapabilityPayload;

    commits(name: string, files: string[]): this;

    prepare(): this;

    start(): this;

    save(): boolean;

}