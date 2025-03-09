
export class CliException extends Error {
    constructor(message: string) {
        super(message);
    }
}
export class NotFoundException extends CliException {
    constructor(message: string) {
        super(message);
    }
}
export class DownloaderException extends CliException {
    constructor(message: string) {
        super(message);
    }
}
export class ExtractorException extends CliException {
    constructor(message: string) {
        super(message);
    }
}