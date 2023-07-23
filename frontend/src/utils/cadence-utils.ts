import { CommonUtils } from "./common-utils";

export class CadenceUtils {
  static parseCadenceError(error: string): Record<string, unknown> {
    function parseKeyValueEntry(entry: string) {
      const targetKeys = [
        "hostname",
        "path",
        "method",
        "requestBody",
        "responseBody",
        "responseStatusText",
        "statusCode",
      ];
      const indexOfSeparator = entry.indexOf("=");
      const key = entry.slice(0, indexOfSeparator);
      const value = entry.slice(indexOfSeparator + 1, entry.length);
      if (targetKeys.includes(key)) {
        return { key, value };
      } else {
        return undefined;
      }
    }

    function formatEntryValue(value: string) {
      try {
        // Try parsing it as JSON, if that fails assume it's a plain string.
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }

    // We only care about subset of the raw error,
    // which contains the structured info in `key=value` pairs.
    // The other part can be discarded as all the info is found in the structured part.
    const structuredEntries = error
      .split(/\n[ +]/)
      .map((line) => line.trim().replace("\n", " "))
      .map((line) => parseKeyValueEntry(line))
      .filter(CommonUtils.isDefined);

    return structuredEntries.reduce(
      (union, entry) => ({
        ...union,
        [entry.key]: formatEntryValue(entry.value),
      }),
      {}
    );
  }
}
