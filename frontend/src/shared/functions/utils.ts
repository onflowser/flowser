export function isInitialParentId(value: number | string) {
    // initial parent id contains only zeros
    return `${value}`.replaceAll('0', '').length === 0;
}
