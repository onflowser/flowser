import { FlowCadenceObject } from "../services/gateway.service";
import {
  CadenceObject,
  LegacyCadenceType,
  legacyCadenceTypeFromJSON,
} from "@flowser/shared";
import { CadenceUtils as SharedCadenceUtils } from "@flowser/shared";
import { isArray } from "../../utils/common-utils";

export class CadenceUtils {
  static isCadenceObject(value: unknown): value is FlowCadenceObject {
    return typeof value === "object" && value !== null && "type" in value;
  }

  static serializeCadenceObject(
    cadenceObject: FlowCadenceObject
  ): CadenceObject {
    const cadenceType = legacyCadenceTypeFromJSON(cadenceObject.type);
    if (SharedCadenceUtils.isNumericType(cadenceType)) {
      return this.serializeNumericValue(cadenceObject);
    }
    switch (cadenceType) {
      case LegacyCadenceType.String:
      case LegacyCadenceType.Address:
        return this.serializeStringLikeValue(cadenceObject);
      case LegacyCadenceType.Array:
        return this.serializeArrayValue(cadenceObject);
      case LegacyCadenceType.Struct:
        return this.serializeStructValue(cadenceObject);
      case LegacyCadenceType.Bool:
        return this.serializeBoolValue(cadenceObject);
      default: {
        console.error(
          `Unimplemented cadence type: ${JSON.stringify(cadenceObject)}`
        );
        return CadenceObject.fromPartial({
          type: cadenceType,
        });
      }
    }
  }

  private static serializeNumericValue(cadenceObject: FlowCadenceObject) {
    return CadenceObject.fromPartial({
      type: legacyCadenceTypeFromJSON(cadenceObject.type),
      numericAttributes: {
        value: Number(String(cadenceObject.value)),
      },
    });
  }

  private static serializeStringLikeValue(cadenceObject: FlowCadenceObject) {
    return CadenceObject.fromPartial({
      type: legacyCadenceTypeFromJSON(cadenceObject.type),
      stringAttributes: {
        value: String(cadenceObject.value),
      },
    });
  }

  private static serializeArrayValue(cadenceObject: FlowCadenceObject) {
    return CadenceObject.fromPartial({
      type: legacyCadenceTypeFromJSON(cadenceObject.type),
      arrayAttributes: {
        value: isArray(cadenceObject.value)
          ? cadenceObject.value.map((value) =>
              this.serializeCadenceObject(value)
            )
          : [],
      },
    });
  }

  private static serializeStructValue(cadenceObject: FlowCadenceObject) {
    return CadenceObject.fromPartial({
      type: legacyCadenceTypeFromJSON(cadenceObject.type),
      structAttributes: {
        // TODO(milestone-x): Not sure how to parse structs
        // See https://www.notion.so/flowser/Improve-cadence-object-parsing-827aa42fba6a434b9b7d999c999f4d30
        fields: [],
      },
    });
  }

  private static serializeBoolValue(cadenceObject: FlowCadenceObject) {
    return CadenceObject.fromPartial({
      type: legacyCadenceTypeFromJSON(cadenceObject.type),
      boolAttributes: {
        value: Boolean(cadenceObject.value),
      },
    });
  }
}
