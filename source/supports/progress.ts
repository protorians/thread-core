import {SingleBar} from "cli-progress";
import * as cliProgress from "cli-progress";
import * as colors from "ansi-colors";
import {ProgressOptions} from "../types";

export namespace ThreadProgress {

    export function create(options: ProgressOptions): SingleBar {
        return new cliProgress.SingleBar({
            format: `${options.name} ${colors.bgBlueBright('{bar}')} {value}/{total}: {percentage}% — {speed}`,
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            hideCursor: typeof options.cursor === 'undefined' ? true : options.cursor,
            clearOnComplete: typeof options.cleanable === 'undefined' ? true : options.cleanable,
        }, cliProgress.Presets.shades_classic)
    }

}