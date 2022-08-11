import {
  CadenceObject,
  CadenceType,
} from "@flowser/types/generated/entities/common";

export class CadenceUtils {
  static getDisplayType(cadenceObject: CadenceObject): string {
    if (this.isPrimitiveType(cadenceObject.type)) {
      return this.getTypeName(cadenceObject.type) ?? "-";
    }
    if (cadenceObject.type === CadenceType.Array) {
      const nestedTypes = cadenceObject.children.map((nestedObject) =>
        this.getDisplayType(nestedObject)
      );
      return `Array<${nestedTypes.join(",")}>`;
    }
    if (cadenceObject.type === CadenceType.Dictionary) {
      // TODO(milestone-2): add support for complex types (e.g. dictionaries)
      return "-";
    }
    return "-";
  }

  static getDisplayValue(cadenceObject: CadenceObject): string {
    if (this.isNumericType(cadenceObject.type)) {
      return cadenceObject.value ?? "-";
    }
    if (this.isStringLikeType(cadenceObject.type)) {
      return cadenceObject.value ? `"${cadenceObject.value}"` : "-";
    }
    if (this.isBoolType(cadenceObject.type)) {
      return cadenceObject.value ?? "-";
    }
    if (cadenceObject.type === CadenceType.Array) {
      const nestedTypes = cadenceObject.children.map((nestedObject) =>
        this.getDisplayValue(nestedObject)
      );
      return `[${nestedTypes.join(",")}]`;
    }
    if (cadenceObject.type === CadenceType.Dictionary) {
      // TODO(milestone-2): add support for complex types (e.g. dictionaries)
      return "-";
    }
    return "-";
  }

  static isPrimitiveType(cadenceType: CadenceType): boolean {
    if (this.isNumericType(cadenceType)) {
      return true;
    }
    if (this.isStringLikeType(cadenceType)) {
      return true;
    }
    return this.isBoolType(cadenceType);
  }

  static isBoolType(cadenceType: CadenceType): boolean {
    return cadenceType === CadenceType.Bool;
  }

  static isNumericType(cadenceType: CadenceType): boolean {
    switch (cadenceType) {
      case CadenceType.UInt:
      case CadenceType.UInt8:
      case CadenceType.UInt16:
      case CadenceType.UInt32:
      case CadenceType.UInt64:
      case CadenceType.UInt128:
      case CadenceType.UInt256:
      case CadenceType.Int:
      case CadenceType.Int8:
      case CadenceType.Int16:
      case CadenceType.Int32:
      case CadenceType.Int64:
      case CadenceType.Int128:
      case CadenceType.Int256:
      case CadenceType.UFix64:
      case CadenceType.Fix64:
        return true;
      default:
        return false;
    }
  }

  static isStringLikeType(cadenceType: CadenceType): boolean {
    switch (cadenceType) {
      case CadenceType.Word8:
      case CadenceType.Word16:
      case CadenceType.Word32:
      case CadenceType.Word64:
      case CadenceType.String:
      case CadenceType.Character:
      case CadenceType.Address:
      case CadenceType.Path:
        return true;
      default:
        return false;
    }
  }

  static getTypeName(cadenceType: CadenceType): string {
    switch (cadenceType) {
      case CadenceType.UInt:
        return "Uint";
      case CadenceType.UInt8:
        return "Uint8";
      case CadenceType.UInt16:
        return "Uint16";
      case CadenceType.UInt32:
        return "UInt32";
      case CadenceType.UInt64:
        return "UInt64";
      case CadenceType.UInt128:
        return "UInt128";
      case CadenceType.UInt256:
        return "UInt256";
      case CadenceType.Int:
        return "Int";
      case CadenceType.Int8:
        return "Int8";
      case CadenceType.Int16:
        return "Int16";
      case CadenceType.Int32:
        return "Int32";
      case CadenceType.Int64:
        return "Int64";
      case CadenceType.Int128:
        return "Int128";
      case CadenceType.Int256:
        return "Int256";
      case CadenceType.Word8:
        return "Word8";
      case CadenceType.Word16:
        return "Word16";
      case CadenceType.Word32:
        return "Word32";
      case CadenceType.Word64:
        return "Word64";
      case CadenceType.UFix64:
        return "UFix64";
      case CadenceType.Fix64:
        return "Fix64";
      case CadenceType.String:
        return "String";
      case CadenceType.Character:
        return "Character";
      case CadenceType.Bool:
        return "Bool";
      case CadenceType.Address:
        return "Address";
      case CadenceType.Path:
        return "Path";
      case CadenceType.Array:
        return "Array";
      case CadenceType.Dictionary:
        return "Dictionary";
      case CadenceType.Optional:
        return "Optional";
      default:
        return "-";
    }
  }
}
