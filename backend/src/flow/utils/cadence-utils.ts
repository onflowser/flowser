import { FlowCadenceObject } from "../services/gateway.service";
import {
  CadenceObject,
  CadenceType,
  cadenceTypeFromJSON,
} from "@flowser/types/generated/entities/cadence";
import { CadenceUtils as SharedCadenceUtils } from "@flowser/types/generated/cadence-utils";
import { isArray } from "../../utils";

export class CadenceUtils {
  static isCadenceObject(value: unknown): value is FlowCadenceObject {
    return typeof value === "object" && "type" in value;
  }

  static serializeCadenceObject(
    cadenceObject: FlowCadenceObject | unknown
  ): CadenceObject {
    if (!this.isCadenceObject(cadenceObject)) {
      return;
    }
    const cadenceType = cadenceTypeFromJSON(cadenceObject.type);
    if (SharedCadenceUtils.isNumericType(cadenceType)) {
      return this.serializeNumericValue(cadenceObject);
    }
    switch (cadenceType) {
      case CadenceType.String:
        return this.serializeStringLikeValue(cadenceObject);
      case CadenceType.Array:
        return this.serializeArrayValue(cadenceObject);
      case CadenceType.Struct:
        return this.serializeStructValue(cadenceObject);
      case CadenceType.Bool:
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
      type: cadenceTypeFromJSON(cadenceObject.type),
      numericAttributes: {
        value: Number(String(cadenceObject.value)),
      },
    });
  }

  private static serializeStringLikeValue(cadenceObject: FlowCadenceObject) {
    return CadenceObject.fromPartial({
      type: cadenceTypeFromJSON(cadenceObject.type),
      stringAttributes: {
        value: String(cadenceObject.value),
      },
    });
  }

  private static serializeArrayValue(cadenceObject: FlowCadenceObject) {
    return CadenceObject.fromPartial({
      type: cadenceTypeFromJSON(cadenceObject.type),
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
      type: cadenceTypeFromJSON(cadenceObject.type),
      structAttributes: {
        // TODO(milestone-x): Not sure how to parse structs
        // See https://www.notion.so/flowser/Improve-cadence-object-parsing-827aa42fba6a434b9b7d999c999f4d30
        fields: [],
      },
    });
  }

  private static serializeBoolValue(cadenceObject: FlowCadenceObject) {
    return CadenceObject.fromPartial({
      type: cadenceTypeFromJSON(cadenceObject.type),
      boolAttributes: {
        value: Boolean(cadenceObject.value),
      },
    });
  }
}
