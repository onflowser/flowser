export class CommonUtils {
  static isStandardError(error: unknown): error is Error {
    return typeof error === "object" && error !== null && "message" in error;
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

  static isDefined<Value>(value: Value | null | undefined): value is Value {
    return value !== null && value !== undefined;
  }
}
