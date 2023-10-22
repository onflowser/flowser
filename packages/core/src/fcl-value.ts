import { CadenceType, CadenceTypeKind, FclArgumentWithMetadata } from "@onflowser/api";

// https://developers.flow.com/tooling/fcl-js/api#argumentfunction
export type FclArgBuilder = (value: FclValue, type: unknown) => void;
export type FclTypeLookup = Record<string, (nestedType?: unknown) => unknown>;
export type FclArgumentFunction = (
  arg: FclArgBuilder,
  t: FclTypeLookup
) => unknown[];

export type FclValue = FclRequiredValue | FclOptionalValue;
export type FclRequiredValue =
  | FclDictionaryValue
  | FclPathValue
  | FclArrayValue
  | FclIntegerNumberValue
  | FclTextualValue
  | FclBoolValue
  | FclAddressValue;
export type FclPathDomain = "public" | "private" | "storage";
export type FclDictionaryEntry = { key: FclValue; value: FclValue };
export type FclDictionaryValue = FclDictionaryEntry[];
export type FclPathValue = { domain: FclPathDomain; identifier: string };
export type FclArrayValue = FclValue[];
// Numeric values must be encoded as strings.
// See: https://github.com/onflow/fcl-js/blob/master/packages/types/WARNINGS.md
export type FclIntegerNumberValue = string;
export type FclFixedPointNumberValue = `${string}.${string}`;
export type FclBoolValue = boolean;
export type FclTextualValue = string;
export type FclAddressValue = `0x${string}`;
export type FclOptionalValue = FclRequiredValue | undefined;

export class FclValueUtils {
  private static readonly decimalNumberPattern = /[0-9]+\.[0-9]+/;

  // Builds a list of fcl encoded parameters.
  // See: https://developers.flow.com/tooling/fcl-js/api#argumentfunction
  static getArgumentFunction(fclArguments: FclArgumentWithMetadata[]) {
    const argumentFunction: FclArgumentFunction = (arg, t) => {
      return fclArguments.map((argument) => {
        return arg(argument.value, this.getFclType(t, argument.type));
      });
    };

    return argumentFunction;
  }

  // Builds a fcl encoded cadence type.
  // See: https://developers.flow.com/tooling/fcl-js/api#ftype
  private static getFclType(
    t: FclTypeLookup,
    cadenceType: CadenceType
  ): unknown {
    switch (cadenceType.kind) {
      case CadenceTypeKind.CADENCE_TYPE_FIXED_POINT_NUMBER:
      case CadenceTypeKind.CADENCE_TYPE_INTEGER_NUMBER:
      case CadenceTypeKind.CADENCE_TYPE_TEXTUAL:
      case CadenceTypeKind.CADENCE_TYPE_ADDRESS:
      case CadenceTypeKind.CADENCE_TYPE_BOOLEAN:
        return t[cadenceType.rawType];
      case CadenceTypeKind.CADENCE_TYPE_ARRAY:
        if (!cadenceType.array?.element) {
          throw new Error("Expected array.element to be set");
        }
        return t.Array(this.getFclType(t, cadenceType.array.element));
      case CadenceTypeKind.CADENCE_TYPE_DICTIONARY:
        if (!cadenceType.dictionary?.key) {
          throw new Error("Expected dictionary.key to be set");
        }
        if (!cadenceType.dictionary?.value) {
          throw new Error("Expected dictionary.value to be set");
        }
        return t.Dictionary({
          key: this.getFclType(t, cadenceType.dictionary.key),
          value: this.getFclType(t, cadenceType.dictionary.value),
        });
      case CadenceTypeKind.CADENCE_TYPE_PATH:
        return t.Path;
      case CadenceTypeKind.CADENCE_TYPE_UNKNOWN:
      default:
        throw new Error("Unknown Cadence type: " + cadenceType.rawType);
    }
  }

  static isFclDictionaryValue(arg: unknown): arg is FclDictionaryValue {
    return (
      arg instanceof Array &&
      arg.every((e) => e instanceof Object && "key" in e && "value" in e)
    );
  }
  static isFclArrayValue(arg: unknown): arg is FclArrayValue {
    return arg instanceof Array;
  }
  static isFclPathValue(arg: unknown): arg is FclPathValue {
    return arg instanceof Object && "domain" in arg && "identifier" in arg;
  }
  static isFclBoolValue(arg: unknown): arg is FclBoolValue {
    return typeof arg === "boolean";
  }
  static isFclFixedPointNumberValue(
    arg: unknown
  ): arg is FclFixedPointNumberValue {
    return (
      typeof arg === "string" &&
      arg !== "" &&
      this.decimalNumberPattern.test(arg) &&
      !Number.isNaN(Number(arg))
    );
  }
  static isFclIntegerNumberValue(arg: unknown): arg is FclIntegerNumberValue {
    return (
      typeof arg === "string" &&
      arg !== "" &&
      !this.decimalNumberPattern.test(arg) &&
      !Number.isNaN(Number(arg))
    );
  }
  static isFclTextualValue(arg: unknown): arg is FclTextualValue {
    return typeof arg === "string";
  }
  static isFclAddressValue(arg: unknown): arg is FclAddressValue {
    return typeof arg === "string" && arg.startsWith("0x");
  }
  static isFclRequiredValue(arg: unknown): arg is FclRequiredValue {
    return (
      this.isFclDictionaryValue(arg) ||
      this.isFclArrayValue(arg) ||
      this.isFclPathValue(arg) ||
      this.isFclIntegerNumberValue(arg) ||
      this.isFclFixedPointNumberValue(arg) ||
      this.isFclTextualValue(arg) ||
      this.isFclAddressValue(arg)
    );
  }
  static isFclOptionalValue(arg: unknown): arg is FclOptionalValue {
    return arg === undefined || this.isFclRequiredValue(arg);
  }
  static isFclValue(arg: unknown): arg is FclValue {
    return this.isFclOptionalValue(arg) || this.isFclRequiredValue(arg);
  }
}
