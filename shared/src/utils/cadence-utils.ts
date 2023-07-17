import { LegacyCadenceType } from "../generated/entities/cadence";

export class CadenceUtils {
  static isPrimitiveType(cadenceType: LegacyCadenceType): boolean {
    if (this.isNumericType(cadenceType)) {
      return true;
    }
    if (this.isStringLikeType(cadenceType)) {
      return true;
    }
    return this.isBoolType(cadenceType);
  }

  static isBoolType(cadenceType: LegacyCadenceType): boolean {
    return cadenceType === LegacyCadenceType.Bool;
  }

  static isNumericType(cadenceType: LegacyCadenceType): boolean {
    switch (cadenceType) {
      case LegacyCadenceType.UInt:
      case LegacyCadenceType.UInt8:
      case LegacyCadenceType.UInt16:
      case LegacyCadenceType.UInt32:
      case LegacyCadenceType.UInt64:
      case LegacyCadenceType.UInt128:
      case LegacyCadenceType.UInt256:
      case LegacyCadenceType.Int:
      case LegacyCadenceType.Int8:
      case LegacyCadenceType.Int16:
      case LegacyCadenceType.Int32:
      case LegacyCadenceType.Int64:
      case LegacyCadenceType.Int128:
      case LegacyCadenceType.Int256:
      case LegacyCadenceType.UFix64:
      case LegacyCadenceType.Fix64:
        return true;
      default:
        return false;
    }
  }

  static isStringLikeType(cadenceType: LegacyCadenceType): boolean {
    switch (cadenceType) {
      case LegacyCadenceType.Word8:
      case LegacyCadenceType.Word16:
      case LegacyCadenceType.Word32:
      case LegacyCadenceType.Word64:
      case LegacyCadenceType.String:
      case LegacyCadenceType.Character:
      case LegacyCadenceType.Address:
      case LegacyCadenceType.Path:
        return true;
      default:
        return false;
    }
  }

  static getTypeName(cadenceType: LegacyCadenceType): string {
    switch (cadenceType) {
      case LegacyCadenceType.UInt:
        return "Uint";
      case LegacyCadenceType.UInt8:
        return "Uint8";
      case LegacyCadenceType.UInt16:
        return "Uint16";
      case LegacyCadenceType.UInt32:
        return "UInt32";
      case LegacyCadenceType.UInt64:
        return "UInt64";
      case LegacyCadenceType.UInt128:
        return "UInt128";
      case LegacyCadenceType.UInt256:
        return "UInt256";
      case LegacyCadenceType.Int:
        return "Int";
      case LegacyCadenceType.Int8:
        return "Int8";
      case LegacyCadenceType.Int16:
        return "Int16";
      case LegacyCadenceType.Int32:
        return "Int32";
      case LegacyCadenceType.Int64:
        return "Int64";
      case LegacyCadenceType.Int128:
        return "Int128";
      case LegacyCadenceType.Int256:
        return "Int256";
      case LegacyCadenceType.Word8:
        return "Word8";
      case LegacyCadenceType.Word16:
        return "Word16";
      case LegacyCadenceType.Word32:
        return "Word32";
      case LegacyCadenceType.Word64:
        return "Word64";
      case LegacyCadenceType.UFix64:
        return "UFix64";
      case LegacyCadenceType.Fix64:
        return "Fix64";
      case LegacyCadenceType.String:
        return "String";
      case LegacyCadenceType.Character:
        return "Character";
      case LegacyCadenceType.Bool:
        return "Bool";
      case LegacyCadenceType.Address:
        return "Address";
      case LegacyCadenceType.Path:
        return "Path";
      case LegacyCadenceType.Array:
        return "Array";
      case LegacyCadenceType.Dictionary:
        return "Dictionary";
      case LegacyCadenceType.Optional:
        return "Optional";
      default:
        return "-";
    }
  }
}
