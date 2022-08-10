export function isInitialParentId(value: number | string): boolean {
  // initial parent id contains only zeros
  return `${value}`.replaceAll("0", "").length === 0;
}

export function isValueSet(value: any): boolean {
  return value !== "" && value !== null && value !== undefined;
}

export function getNestedValue<ObjectType>(object: ObjectType, path: string) {
  const keys = path.split(".");
  let result: any = object;
  for (const key of keys) {
    if (result[key] === undefined) {
      return undefined;
    }
    result = result[key];
  }
  return result;
}
