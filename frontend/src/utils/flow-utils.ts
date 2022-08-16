import {
  HashAlgorithm,
  SignatureAlgorithm,
} from "@flowser/types/generated/entities/common";
import { GrcpStatusCode } from "@flowser/types/generated/entities/transactions";
import { AccountStorageDomain } from "@flowser/types/generated/entities/accounts";

export class FlowUtils {
  static isInitialBlockId(value: number | string): boolean {
    // initial parent id contains only zeros
    return `${value}`.replaceAll("0", "").length === 0;
  }

  static getLowerCasedPathDomain(pathDomain: AccountStorageDomain): string {
    switch (pathDomain) {
      case AccountStorageDomain.STORAGE_DOMAIN_PUBLIC:
        return "public";
      case AccountStorageDomain.STORAGE_DOMAIN_PRIVATE:
        return "private";
      case AccountStorageDomain.STORAGE_DOMAIN_STORAGE:
        return "storage";
      default:
        return "unknown";
    }
  }

  static getGrcpStatusName(statusCode: GrcpStatusCode | undefined): string {
    switch (statusCode) {
      case GrcpStatusCode.GRCP_STATUS_OK:
        return "Ok";
      case GrcpStatusCode.GRCP_STATUS_CANCELLED:
        return "Cancelled";
      case GrcpStatusCode.GRCP_STATUS_UNKNOWN:
        return "Unknown";
      case GrcpStatusCode.GRCP_STATUS_INVALID_ARGUMENT:
        return "Invalid argument";
      case GrcpStatusCode.GRCP_STATUS_DEADLINE_EXCEEDED:
        return "Deadline exceeded";
      case GrcpStatusCode.GRCP_STATUS_NOT_FOUND:
        return "Not found";
      case GrcpStatusCode.GRCP_STATUS_ALREADY_EXISTS:
        return "Already exists";
      case GrcpStatusCode.GRCP_STATUS_PERMISSION_DENIED:
        return "Permission denied";
      case GrcpStatusCode.GRCP_STATUS_RESOURCE_EXHAUSTED:
        return "Resource exhausted";
      case GrcpStatusCode.GRCP_STATUS_FAILED_PRECONDITION:
        return "Failed precondition";
      case GrcpStatusCode.GRCP_STATUS_ABORTED:
        return "Aborted";
      case GrcpStatusCode.GRCP_STATUS_OUT_OF_RANGE:
        return "Out of range";
      case GrcpStatusCode.GRCP_STATUS_UNIMPLEMENTED:
        return "Unimplemented";
      case GrcpStatusCode.GRCP_STATUS_INTERNAL:
        return "Internal";
      case GrcpStatusCode.GRCP_STATUS_UNAVAILABLE:
        return "Unavailable";
      case GrcpStatusCode.GRCP_STATUS_DATA_LOSS:
        return "Data loss";
      case GrcpStatusCode.GRCP_STATUS_UNAUTHENTICATED:
        return "Unauthenticated";
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
