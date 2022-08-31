import { CadenceObject, CadenceType, cadenceTypeToJSON } from "@flowser/shared";
import { CadenceUtils as SharedCadenceUtils } from "@flowser/shared";

export class CadenceUtils {
  static getDisplayType(cadenceObject: CadenceObject): string {
    if (SharedCadenceUtils.isPrimitiveType(cadenceObject.type)) {
      return SharedCadenceUtils.getTypeName(cadenceObject.type) ?? "-";
    }
    if (cadenceObject.type === CadenceType.Array) {
      const nestedTypes =
        cadenceObject.arrayAttributes?.value.map((nestedObject) =>
          this.getDisplayType(nestedObject)
        ) ?? [];
      return `Array<${nestedTypes.join(",")}>`;
    }
    return cadenceTypeToJSON(cadenceObject.type);
  }

  static getDisplayValue(cadenceObject: CadenceObject): string {
    if (SharedCadenceUtils.isNumericType(cadenceObject.type)) {
      return String(cadenceObject.numericAttributes?.value) ?? "-";
    }
    if (SharedCadenceUtils.isStringLikeType(cadenceObject.type)) {
      return cadenceObject.stringAttributes
        ? `"${cadenceObject.stringAttributes?.value}"`
        : "-";
    }
    if (SharedCadenceUtils.isBoolType(cadenceObject.type)) {
      return String(cadenceObject.boolAttributes?.value) ?? "-";
    }
    if (cadenceObject.type === CadenceType.Array) {
      const nestedTypes =
        cadenceObject.arrayAttributes?.value.map((nestedObject) =>
          this.getDisplayValue(nestedObject)
        ) ?? [];
      return `[${nestedTypes.join(",")}]`;
    }
    if (cadenceObject.type === CadenceType.Dictionary) {
      // TODO(milestone-3): add support for complex shared (e.g. dictionaries)
      return "-";
    }
    return "-";
  }
}
