import {ISignalStack} from "@protorians/core";

export type IRuneScheme = {
    meta: IRuneMeta;
    payload: IRunePayloads
}

export type IRuneMeta = IRuneDumperConfig & {
    timestamp: number;
}

export type IRuneContext = {
    instance: IRuneDumper;
    data: IRunePayload
}

export type IRunePayload = {
    name: string;
    file: string;
}

export type IRuneConfig = {
    slug: string;
    name: string;
    description?: string;
    workdir?: string;
    command: string;
    options?: string[][];
    arguments?: string[][];
    files?: string[];
}

export type IRunePayloads = {
    [K: string]: IRuneConfig
}

export type IRuneDumperConfig = {
    directory: string;
    prebuild: boolean;
    output: string;
    allow: (string | RegExp)[];
    silent: boolean;
}

export interface IRuneDumperSignalMap {
    commit: IRuneContext;
    commits: {
        name: string;
        instance: IRuneDumper;
        files: string[]
    };
}

export interface IRuneDumper {

    readonly signal: ISignalStack<IRuneDumperSignalMap>

    readonly config: IRuneDumperConfig;

    commit(name: string, file: string): IRunePayload;

    commits(name: string, files: string[]): this;

    prepare(): this;

    start(): this;

    save(): boolean;

}