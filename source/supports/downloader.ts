import * as fs from "fs";
import * as path from "path";
import {SingleBar} from "cli-progress";
import {ThreadString} from "./string";
import {Terminal} from "./terminal";
import {IDownloader, IDownloaderConfig} from "../types/downloader";
import {DownloaderException} from "../exception";
import {ThreadProgress} from "./progress";
import {ThreadDirectory, ThreadFile} from "./fs.manager";
import {existsSync} from "node:fs";
import {basename} from "path";
import {Ora} from "ora";

export namespace ThreadDownloader {

    export class Create implements IDownloader {
        protected _config: Partial<IDownloaderConfig> = {info: true};
        protected _exception: DownloaderException | undefined;
        protected _response: Response | undefined;
        protected _downloaded: string | undefined;
        protected _slug: string | undefined;
        protected _copied: string[] | undefined;
        protected _extracted: string[] | undefined;

        get config(): Partial<IDownloaderConfig> {
            return this._config;
        }

        get slug(): string | undefined {
            return this._slug;
        }

        get downloaded(): string | undefined {
            return this._downloaded;
        }

        get exception(): DownloaderException | undefined {
            return this._exception;
        }

        get response(): Response | undefined {
            return this._response;
        }

        get copied(): string[] | undefined {
            return this._copied;
        }

        get extracted(): string[] | undefined {
            return this._extracted;
        }

        get basename(): string | undefined {
            if (this._downloaded) {
                const base = basename(this._downloaded)
                return base.substring(0, base.lastIndexOf(".")) || base;
            }
            return undefined
        }

        caches(directory: string): this {
            this._config.caches = directory;
            this.cacheable(true);
            return this;
        }

        cacheable(cacheable: boolean): this {
            this._config.cacheable = cacheable;
            this.cleanable(true);
            return this;
        }

        cleanable(cleanable: boolean): this {
            this._config.cleanable = cleanable;
            return this;
        }

        extension(extension: string): this {
            this._config.extension = extension;
            return this;
        }

        name(name: string): this {
            this._config.name = name;
            return this;
        }

        output(output: string): this {
            this._config.output = output;
            return this;
        }

        silent(silent: boolean): this {
            this._config.silent = silent;
            return this;
        }

        info(info: boolean): this {
            this._config.info = info;
            return this;
        }

        url(url: string): this {
            this._config.url = url;
            return this;
        }


        async process(): Promise<this> {
            let progress: SingleBar | undefined;
            let spinner: Ora | undefined = undefined

            try {

                if (!this._config.silent) {
                    spinner = await ThreadProgress.createSpinner(`Get ${this._config.name} rune...`);
                    spinner.start()
                    spinner.color = 'cyan'
                }

                this._config.output = this._config.output || process.cwd();

                if (!this._config.name) {
                    throw new DownloaderException("Name not found");
                }

                if (!this._config.url) {
                    throw new DownloaderException("Url not found");
                }

                const response = await fetch(this._config.url);
                // spinner?.clear()
                spinner?.stop()

                if (!response.ok) {
                    Terminal.Display.info("INFO", this._config.name, 'not found')
                    throw new DownloaderException(`Erreur HTTP ${response.status}`);
                }

                let filename = this._config.url;
                const contentDisposition = response.headers.get("content-disposition");
                if (contentDisposition) {
                    const match = contentDisposition.match(/filename="?([^"]+)"?/);
                    if (match) filename = match[1];
                }

                this._slug = ThreadString.nameable(
                    ThreadString.nameFromUrl(filename) ||
                    `${this._config.name}${this._config.extension?.trim().length ? this._config.extension : ''}`
                );
                this._downloaded = (this._config.cacheable && this._config.caches)
                    ? `${path.join(this._config.caches, this._slug)}`
                    : `${path.join(this._config.output, this._slug)}`

                const size = response.headers.get("content-length");
                if (!size && response.status != 200) throw new DownloaderException("Not found");

                progress = (size && this._config.silent === false)
                    ? ThreadProgress.create({
                        name: this._slug || this._config.name,
                        cleanable: true,
                    })
                    : undefined;

                progress?.start(parseInt(size || '0'), 0);

                if (!response.body) throw new DownloaderException("No available response found");

                if (!fs.existsSync(this._config.output)) {
                    fs.mkdirSync(this._config.output, {recursive: true});
                }

                const stream = fs.createWriteStream(this._downloaded);
                let cursor = 0;

                for await (const chunk of response.body as any) {
                    cursor += chunk.length;
                    progress?.update(cursor);
                    stream.write(chunk);
                }

                stream.end();
                progress?.stop();
                if (!this._config.silent && this._config.info) Terminal.Display.info("TASK", `${this._config.name} downloaded!`);

            } catch (error: any) {
                if (progress) progress.stop()
                this._exception = error;
                if (!this._config.silent) Terminal.Display.error("ERR", error.message);
            }

            return this;
        }


        async extract(): Promise<this> {

            try {

                if (!this._config.name) {
                    throw new DownloaderException("Name not found");
                }

                if (!this._downloaded) {
                    throw new DownloaderException("Download not found");
                }

                if (!existsSync(this._downloaded)) {
                    throw new DownloaderException("Downloaded file does not exists");
                }

                this._extracted = [];
                const output = this._config.output || process.cwd();
                const cleanable = typeof this._config.cleanable === 'undefined' ? true : this._config.cleanable;

                await ThreadFile.extraction(this._config.name, this._downloaded, output)
                    .catch(err => this._exception = err)

                if (cleanable) fs.unlinkSync(this._downloaded);
                if (!this._config.silent && this._config.info) Terminal.Display.info("TASK", `${this._config.name} extracted!`);

            } catch (error: any) {
                this._exception = error;
                if (!this._config.silent) Terminal.Display.error("ERR", 'Extracting failed \n\n', error.message);
            }

            return this;

        }


        copy(directory: string): this {
            try {
                const output: string | undefined = this._downloaded || this._config.output;

                if (!this._config.name) {
                    throw new DownloaderException("Name not found");
                }
                if (!output) {
                    throw new DownloaderException("Output not found");
                }
                if (!existsSync(output)) {
                    throw new DownloaderException("Output does not exists");
                }
                this._copied = ThreadDirectory.copy(this._config.name, output, directory)

                if (!this._config.silent) Terminal.Display.info("TASK", `${this._config.name} copied!`);
                return this;
            } catch (error: any) {
                this._exception = error;
                if (!this._config.silent && this._config.info) Terminal.Display.error("ERR", 'Extracting failed \n\n', error.message);
            }

            return this
        }

    }


    export class Group {

        protected pointer: number = 0;
        protected _downloaded: number = 0;
        readonly length: number = 0;
        protected progress: SingleBar | undefined;
        protected _instances: IDownloader[] = []

        constructor(
            readonly entries: string[],
            readonly output: string,
            readonly caches: string | null = null,
            readonly extension: string | null = null,
        ) {
            this.length = entries.length;

            this.progress = ThreadProgress.create({
                name: 'Downloading',
            })
            this.progress?.start(this.length, 0);
        }

        get downloaded(): number {
            return this._downloaded;
        }

        get instances(): IDownloader[] {
            return this._instances
        }

        async next() {
            const entry = this.entries.shift();

            if (entry) {
                const downloader = (new Create())
                    .name(basename(entry).split('?')[0])
                    .url(entry)
                    .caches(this.caches || this.output)
                    .silent(true)

                if (this.extension) downloader.extension(this.extension)

                this._instances.push(downloader);
                await downloader.process()
                    .then((status) => {
                        this._downloaded++;
                        this.progress?.update(this._downloaded);
                        return status;
                    })
                    .finally(async () => await this.next())

                return false;
            } else {
                this.progress?.stop();
                Terminal.Display.success("TASK", `Download complete (${this._downloaded}/${this.length})`);
                return true;
            }
        }


    }


}

