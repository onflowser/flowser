export class CommonUtils {
  static isNotEmpty<Value>(value: Value | null | undefined): value is Value {
    return value !== null && value !== undefined;
  }

  static getNestedValue(object: unknown, path: string): unknown {
    const keys = path.split(".");
    let result: unknown = object;
    for (const key of keys) {
      if (!this.isRecord(result)) {
        return undefined;
      }
      result = result[key];
    }
    return result;
  }

  static isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }
}
