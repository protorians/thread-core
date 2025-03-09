import {existsSync, readFileSync} from "node:fs";
import {ThreadObject} from "./object";


export namespace ThreadConfig {

    export class Loader<T> {

        readonly current: T | undefined;

        constructor(
            public readonly source: string,
        ) {
            this.current = existsSync(source) ? JSON.parse(`${readFileSync(source)}`) : undefined;
        }

        get<K extends keyof T>(key: K | string): T[K] | undefined {
            return this.current ? (ThreadObject.toNested(this.current, key as string)) : undefined
        }

        get exists(): boolean {
            return typeof this.current !== 'undefined';
        }

    }
}
