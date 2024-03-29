import {
  FlowStorageDomain,
  ExecutionStatusCode,
  GrcpStatusCode,
  HashAlgorithm,
  SignatureAlgorithm,
} from "@onflowser/api";
import { CommonUtils } from "./common-utils";

type FlowScriptError = {
  hostname: string;
  path: string;
  method: string;
  requestBody: {
    script: string;
    arguments: unknown[];
  };
  responseBody?: {
    number: string;
    message: string;
  };
  statusCode: number;
  responseStatusText: string;
};

export class FlowUtils {
  // Returned by fcl.script call.
  // https://developers.flow.com/tooling/fcl-js/api#script
  // In case the error can't be parsed, it returns `undefined`.
  static parseScriptError(errorMessage: string): FlowScriptError | undefined {
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
    const structuredEntries = errorMessage
      .split(/\n[ +]/)
      .map((line) => line.trim().replace("\n", " "))
      .map((line) => parseKeyValueEntry(line))
      .filter(CommonUtils.isDefined);

    // If no structured entries are found, fallback to raw error message.
    if (structuredEntries.length === 0) {
      return undefined;
    }

    return structuredEntries.reduce(
      (union, entry) => ({
        ...union,
        [entry.key]: formatEntryValue(entry.value),
      }),
      {},
    ) as FlowScriptError;
  }

  static isInitialBlockId(blockId: number | string): boolean {
    // initial parent id contains only zeros
    return `${blockId}`.replaceAll("0", "").length === 0;
  }

  static getLowerCasedPathDomain(pathDomain: FlowStorageDomain): string {
    switch (pathDomain) {
      case FlowStorageDomain.STORAGE_DOMAIN_PUBLIC:
        return "public";
      case FlowStorageDomain.STORAGE_DOMAIN_PRIVATE:
        return "private";
      case FlowStorageDomain.STORAGE_DOMAIN_STORAGE:
        return "storage";
      default:
        return "unknown";
    }
  }

  static getGrcpStatusName(statusCode: GrcpStatusCode | undefined): string {
    switch (statusCode) {
      case GrcpStatusCode.GRCP_STATUS_OK:
        return "Success";
      case GrcpStatusCode.GRCP_STATUS_FAILED:
        return "Failed";
      default:
        return "?";
    }
  }

  static getShortedBlockId(blockId: string): string {
    const charsToTake = 5;
    return `${blockId.slice(0, charsToTake)}...${blockId.slice(
      blockId.length - charsToTake,
      blockId.length,
    )}`;
  }

  static getExecutionStatusName(
    statusCode: ExecutionStatusCode | undefined,
  ): string {
    switch (statusCode) {
      case ExecutionStatusCode.EXECUTION_STATUS_EXECUTED:
        return "Executed";
      case ExecutionStatusCode.EXECUTION_STATUS_EXPIRED:
        return "Expired";
      case ExecutionStatusCode.EXECUTION_STATUS_FINALIZED:
        return "Finalized";
      case ExecutionStatusCode.EXECUTION_STATUS_SEALED:
        return "Sealed";
      case ExecutionStatusCode.EXECUTION_STATUS_PENDING:
        return "Pending";
      case ExecutionStatusCode.EXECUTION_STATUS_UNKNOWN:
        return "Unknown";
      default:
        return "-";
    }
  }

  static getHashAlgoName(hashAlgo: HashAlgorithm): string {
    switch (hashAlgo) {
      case HashAlgorithm.SHA2_256:
        return "SHA2-256";
      case HashAlgorithm.SHA2_384:
        return "SHA2-384";
      case HashAlgorithm.SHA3_256:
        return "SHA3-256";
      case HashAlgorithm.SHA3_384:
        return "SHA3-384";
      case HashAlgorithm.KECCAK_256:
        return "KECCAK-256";
      case HashAlgorithm.KMAC128_BLS_BLS12_381:
        return "KMAC128-BLS-BLS12-381";
      default:
        return "-";
    }
  }

  static getSignatureAlgoName(signAlgo: SignatureAlgorithm): string {
    switch (signAlgo) {
      case SignatureAlgorithm.ECDSA_P256:
        return "ECDSA-P256";
      case SignatureAlgorithm.ECDSA_secp256k1:
        return "ECDSA-secp256k1";
      case SignatureAlgorithm.BLS_BLS12_381:
        return "BLS-BLS12-381";
      default:
        return "-";
    }
  }
}
