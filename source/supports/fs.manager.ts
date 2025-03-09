import {statSync, mkdirSync, existsSync, readdirSync, copyFileSync} from "node:fs";
import {ThreadProgress} from "./progress";
import * as path from "node:path";
import * as AdmZip from "adm-zip";
import {SingleBar} from "cli-progress";
import * as fs from "node:fs";
import * as extractZip from "extract-zip";
import {ExtractorException} from "../exception";


export namespace ThreadDirectory {

    export function initialize(directory: string): string | null {
        try {
            const exists = existsSync(directory);
            if (!exists) mkdirSync(directory, {recursive: true});
            if (exists && !statSync(directory).isDirectory()) mkdirSync(directory, {recursive: true});
            return directory;
        } catch (e) {
            return null;
        }
    }

    export function copy(name: string, from: string, to: string): string[] {
        let copied: string[] = [];
        const entries = readdirSync(from);
        const length = entries.length;
        const progress = ThreadProgress.create({
            name: `Copying ${name}`,
        })

        progress.start(length, 0)
        for (const entry of entries) {
            const source = path.join(from, entry);
            const destination = path.join(to, entry);
            const stats = statSync(source);

            if (stats.isDirectory()) {
                copied = [...copied, ...copy(name, source, destination)]
            } else {
                copyFileSync(source, destination);
                copied.push(destination);
            }
        }
        progress.stop();
        return copied;
    }

}


export namespace ThreadFile {

    export async function extraction(name: string, filename: string, output: string) {
        return new Promise(async (resolve, reject) => {
            let extracted: string[] = [];

            try {
                extracted = extractWithProgression(name, filename, output);
                if (!Array.isArray(extracted)) throw new ExtractorException('Extracting Failed')
                resolve(extracted);
            } catch (error: any) {
                extracted = await extractWithoutProgression(filename, output)
                if (!Array.isArray(extracted)) reject('Extracting Failed')
                resolve(extracted);
            }
        })
    }

    export async function extractWithoutProgression(filename: string, output: string) {

        try {
            const entries: string[] = [];
            await extractZip(filename, {
                dir: output,
                onEntry: (entry) => entries.push(entry.fileName),
            });
            return entries;
        } catch (error: any) {
            return error;
        }
    }

    export function extractWithProgression(name: string, filename: string, output: string) {

        let progress: SingleBar | undefined;
        try {

            const extracted: string[] = [];
            const zip = new AdmZip(filename);
            const entries = zip.getEntries();
            const length = entries.length;
            let count = 0;

            progress = ThreadProgress.create({
                name: `Extracting ${name}`,
            });

            progress.start(length, 0)
            for (const entry of entries) {
                if (!entry.isDirectory) {
                    const filePath = path.join(output, entry.entryName);
                    fs.mkdirSync(path.dirname(filePath), {recursive: true});
                    fs.writeFileSync(filePath, entry.getData());

                    count++;
                    extracted.push(filePath);
                    progress.update(count);
                }
            }
            progress.stop();
            return extracted;
        } catch (error: any) {
            progress?.stop();
            return error;
        }

    }

}
