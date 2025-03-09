import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {Command} from "commander";
import {IPackage} from "../types";


export namespace ThreadManager {

    let instance: Command | undefined;

    export function serializeArgv(argv: string | string[]): string[] {
        return typeof argv === "string" ? [argv] : argv;
    }

    export function packageInfo(appDir: string | undefined): IPackage {
        return JSON.parse(`${readFileSync(`${resolve(appDir || process.cwd(), './package.json')}`)}`)
    }

    export function create(): Command {
        instance = instance instanceof Command ? instance : new Command();
        return instance;
    }

}
