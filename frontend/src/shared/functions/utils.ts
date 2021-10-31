export function isInitialParentId(value: number | string): boolean {
    // initial parent id contains only zeros
    return `${value}`.replaceAll('0', '').length === 0;
}

export function isValueSet(value: any): boolean {
    return value !== '' && value !== null && value !== undefined;
}
