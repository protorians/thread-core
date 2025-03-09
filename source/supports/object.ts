export namespace ThreadObject {
    export function toNested<T>(obj: T, nestedPath: string): any {
        return nestedPath.split('.').reduce((acc, key) => acc && acc[key], obj);
    }

    export function deepMerge(
        input: any,
        prefix?: string,
        suffix?: string,
    ): string[] {
        const result: string[] = [];

        function deep(value: any) {
            if (Array.isArray(value)) {
                value.forEach(deep);
            } else if (typeof value === "object" && value !== null) {
                Object.values(value).forEach(deep);
            } else {
                result.push(`${prefix || ''}${String(value)}${suffix || ''}`);
            }
        }

        deep(input);
        return result;
    }

}