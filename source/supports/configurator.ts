import {existsSync, readFileSync, writeFileSync} from "node:fs";
import {ThreadObject} from "./object";
import {Environment} from "@protorians/core";


export namespace ThreadConfig {

    export class Loader<T> {

        protected _schematic: T | undefined;

        constructor(
            public readonly source: string,
        ) {
            this._schematic = existsSync(source) ? JSON.parse(`${readFileSync(source)}`) : undefined;
        }

        get schematic(): T | undefined {
            return this._schematic;
        }

        get exists(): boolean {
            return typeof this._schematic !== 'undefined';
        }

        get(key: string): T[keyof T] | undefined {
            return (this._schematic && (key in (this._schematic || {}))) ? this._schematic[key] : undefined
        }

        value<K extends keyof T>(key: K): T[K] | undefined {
            return this._schematic ? (ThreadObject.toNested(this._schematic, key as string)) : undefined
        }

        update<K extends keyof T>(key: K, value: T[K]): this {
            if (typeof this._schematic !== 'undefined')
                this._schematic[key] = value;
            return this;
        }

        remove<K extends keyof T>(key: K): this {
            if (this._schematic && this._schematic[key as string] !== undefined) {

                if (Environment.Client) {
                    const accumulate: T = {} as T
                    Object.entries(this._schematic).forEach(([k, value]) => {
                        if (k !== key) accumulate[k] = value;
                    });
                    this._schematic = accumulate;
                }

                if (!Environment.Client) {
                    delete this._schematic[key as string];
                }
            }
            return this;
        }


        save(): boolean {
            try {
                if (!this.source) return false;
                writeFileSync(this.source, JSON.stringify(this._schematic || {}))
                return true;
            } catch (e) {
                return false;
            }
        }

    }
}
