export type ComputedEventData = {
  name: string;
  type: string;
  value: string;
};

export class EventUtils {
  static computeEventData(data: Record<string, unknown>): ComputedEventData[] {
    const keys = Object.keys(data);
    return keys.map((key) => {
      const item = data[key];
      return {
        name: key,
        type: this.getEventDataType(item),
        value: `${JSON.stringify(item)}`,
      };
    });
  }

  static getEventDataType(value: unknown): string {
    switch (true) {
      case typeof value === "number":
        return "Number";
      case typeof value === "string":
        return "String";
      case value instanceof Array:
        return "Array";
      case value instanceof Object:
        return "Object";
      case value === null:
        return "NULL";
      default:
        return "unknown";
    }
  }
}
