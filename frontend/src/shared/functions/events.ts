export function getEventDataValue(arg: any, indent = false) {
    const _getValue = (arg: any) => {
        if (arg.type === 'Array') {
            return arg.value.map(_getValue);
        } else if (arg.type === 'Dictionary') {
            return arg.value
                .map((arg: any) => ({ [arg.key.value]: _getValue(arg.value) }))
                .reduce((p: any, c: any) => ({ ...p, ...c }), {});
        } else {
            return arg.value;
        }
    };
    const out = _getValue(arg);
    return indent ? JSON.stringify(out, null, 4) : JSON.stringify(out);
}

export function getEventDataType(arg: any): string {
    if (!arg) {
        return '';
    }
    if (arg.type === 'Array') {
        return `Array<${getEventDataType(arg.value[0])}>`;
    } else if (arg.type === 'Dictionary') {
        const keyType = getEventDataType(arg.value[0].key);
        const valueType = getEventDataType(arg.value[0].value);
        return `Dictionary<${keyType}, ${valueType}>`;
    } else {
        return arg.type;
    }
}
