export function isNotEmpty<Value>(
  value: Value | null | undefined
): value is Value {
  return value !== null && value !== undefined;
}

export function getNestedValue(object: unknown, path: string): unknown {
  const keys = path.split(".");
  let result: unknown = object;
  for (const key of keys) {
    if (!isRecord(result)) {
      return undefined;
    }
    result = result[key];
  }
  return result;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
