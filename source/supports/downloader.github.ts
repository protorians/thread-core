import {IRepositoryPathname} from "../types";
import {ThreadDownloader} from "./downloader";
import {IDownloader} from "../types/downloader";


export namespace GithubDownloader {

    export function getGithubRepositoryDownloadUrl(repository: string) {
        return `https://github.com/${repository}/archive/refs/heads/main.zip`
    }

    export function getGithubTagDownloadUrl(owner: string, repository: string, tag: string) {
        return `https://github.com/${owner}/${repository}/archive/refs/tags/${tag}.zip`
    }

    export function parseRepositoryPathname(pathname: string): IRepositoryPathname | undefined {
        const matched = pathname.match(/^([\w-]+)\/([\w-]+)@([\w.-]+)$/)
        return matched ? {
            owner: matched[1].toString().trim(),
            repository: matched[2].toString().trim(),
            version: matched[3].toString().trim(),
        } : undefined;
    }

    export function getGithubDownloadUrl(pathname: string) {
        const info = parseRepositoryPathname(pathname);
        return info ? getGithubTagDownloadUrl(info.owner, info.repository, info.version) : getGithubRepositoryDownloadUrl(pathname);
    }


    export class RepositoryDownloader {

        protected _downloader: IDownloader;

        constructor(
            public readonly name: string,
            cacheDir: string,
            outputDir: string,
        ) {
            this._downloader = (new ThreadDownloader.Create())
                .name(name)
                .url(getGithubDownloadUrl(name))
                .extension('.zip')
                .caches(cacheDir)
                .output(outputDir || process.cwd())
        }

        get downloader(): IDownloader {
            return this._downloader;
        }

        async process() {
            const download = await this._downloader.process();
            return download.extract();
        }
    }

}

