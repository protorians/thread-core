import {DownloaderException} from "../exception";

export type IDownloaderConfig = {
    name: string;
    url: string;
    output: string;
    caches: string;
    cacheable?: boolean;
    cleanable?: boolean;
    extension?: string;
    silent?: boolean;
    info?: boolean;
}


export interface IDownloader {
    get config(): Partial<IDownloaderConfig>;

    get slug(): string | undefined;

    get response(): Response | undefined;

    get copied(): string[] | undefined;

    get extracted(): string[] | undefined;

    get basename(): string | undefined;

    get downloaded(): string | undefined;

    get exception(): DownloaderException | undefined;

    name(name: string): this;

    url(url: string): this;

    output(output: string): this;

    extension(extension: string): this;

    silent(silent: boolean): this;

    info(info: boolean): this;

    caches(directory: string): this;

    cacheable(cacheable: boolean): this;

    cleanable(cleanable: boolean): this

    process(): Promise<this>;

    extract(): Promise<this>;

    copy(directory: string): this;
}