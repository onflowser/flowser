import {
  AccountStorageDomain,
  GrcpStatusCode,
  HashAlgorithm,
  SignatureAlgorithm,
  ExecutionStatusCode,
  Block,
} from "@flowser/shared";

export class FlowUtils {
  static getUserAvatarUrl(address: string): string {
    const isServiceAccount = [
      "0xf8d6e0586b0a20c7",
      "0x0000000000000001", // When using monotonic addresses setting
    ].includes(address);
    if (isServiceAccount) {
      return "http://localhost:8701/settings.svg";
    }
    const appName = "Flowser";
    return `https://avatars.onflow.org/avatar/avatar/${address}-${appName}.svg`;
  }

  static isInitialBlockId(blockId: number | string): boolean {
    // initial parent id contains only zeros
    return `${blockId}`.replaceAll("0", "").length === 0;
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
      blockId.length
    )}`;
  }

  static getExecutionStatusName(
    statusCode: ExecutionStatusCode | undefined
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
