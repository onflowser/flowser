import {
  AccountStorageDomain,
  GrcpStatusCode,
  HashAlgorithm,
  SignatureAlgorithm,
  ExecutionStatusCode,
  Block,
} from "@flowser/shared";
import React from "react";
import { ReactComponent as ExpiredIcon } from "../assets/icons/expired-tx-icon.svg";
import { ReactComponent as SealedIcon } from "../assets/icons/sealed-tx-icon.svg";
import { ReactComponent as UnknownIcon } from "../assets/icons/unknown-tx-icon.svg";
import { ReactComponent as PendingIcon } from "../assets/icons/pending-tx-icon.svg";
import { ReactComponent as FinalizedIcon } from "../assets/icons/finalised-tx-icon.svg";
import { ReactComponent as ExecutedIcon } from "../assets/icons/executed-tx-icon.svg";

export class FlowUtils {
  static getUserAvatarUrl(address: string): string {
    // TODO(milestone-x): Read this from fcl-js config
    const isServiceAccount = address === "0xf8d6e0586b0a20c7";
    if (isServiceAccount) {
      return "http://localhost:8701/settings.svg";
    }
    const appName = "Flowser";
    return `https://avatars.onflow.org/avatar/avatar/${address}-${appName}.svg`;
  }

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

  static getShortedBlockId(block: Block): string {
    const { id } = block;
    const charsToTake = 5;
    return `${id.slice(0, charsToTake)}...${id.slice(
      id.length - charsToTake,
      id.length
    )}`;
  }

  static getGrcpStatusIcon(
    statusCode: GrcpStatusCode | undefined
  ): JSX.Element {
    switch (statusCode) {
      case GrcpStatusCode.GRCP_STATUS_OK:
        return <SealedIcon />;
      case GrcpStatusCode.GRCP_STATUS_CANCELLED:
      case GrcpStatusCode.GRCP_STATUS_INVALID_ARGUMENT:
      case GrcpStatusCode.GRCP_STATUS_DEADLINE_EXCEEDED:
      case GrcpStatusCode.GRCP_STATUS_NOT_FOUND:
      case GrcpStatusCode.GRCP_STATUS_ALREADY_EXISTS:
      case GrcpStatusCode.GRCP_STATUS_PERMISSION_DENIED:
      case GrcpStatusCode.GRCP_STATUS_RESOURCE_EXHAUSTED:
      case GrcpStatusCode.GRCP_STATUS_FAILED_PRECONDITION:
      case GrcpStatusCode.GRCP_STATUS_ABORTED:
      case GrcpStatusCode.GRCP_STATUS_OUT_OF_RANGE:
      case GrcpStatusCode.GRCP_STATUS_UNIMPLEMENTED:
      case GrcpStatusCode.GRCP_STATUS_INTERNAL:
      case GrcpStatusCode.GRCP_STATUS_UNAVAILABLE:
      case GrcpStatusCode.GRCP_STATUS_DATA_LOSS:
      case GrcpStatusCode.GRCP_STATUS_UNAUTHENTICATED:
        return <ExpiredIcon />;
      case GrcpStatusCode.GRCP_STATUS_UNKNOWN:
      default:
        return <UnknownIcon />;
    }
  }

  static getExecutionStatusIcon(
    statusCode: ExecutionStatusCode | undefined
  ): JSX.Element {
    switch (statusCode) {
      case ExecutionStatusCode.EXECUTION_STATUS_EXECUTED:
        return <ExecutedIcon />;
      case ExecutionStatusCode.EXECUTION_STATUS_EXPIRED:
        return <ExpiredIcon />;
      case ExecutionStatusCode.EXECUTION_STATUS_FINALIZED:
        return <FinalizedIcon />;
      case ExecutionStatusCode.EXECUTION_STATUS_SEALED:
        return <SealedIcon />;
      case ExecutionStatusCode.EXECUTION_STATUS_PENDING:
        return <PendingIcon />;
      case ExecutionStatusCode.EXECUTION_STATUS_UNKNOWN:
        return <UnknownIcon />;
      default:
        return <></>;
    }
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
