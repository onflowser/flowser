import {
  HashAlgorithm,
  SignatureAlgorithm,
} from "@flowser/types/generated/entities/common";

export function isInitialParentId(value: number | string): boolean {
  // initial parent id contains only zeros
  return `${value}`.replaceAll("0", "").length === 0;
}

export function isValueSet(value: any): boolean {
  return value !== "" && value !== null && value !== undefined;
}

export function getNestedValue<ObjectType>(object: ObjectType, path: string) {
  const keys = path.split(".");
  let result: any = object;
  for (const key of keys) {
    if (result[key] === undefined) {
      return undefined;
    }
    result = result[key];
  }
  return result;
}

export function getHashAlgoName(hashAlgo: HashAlgorithm) {
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
    default:
      return "-";
  }
}

export function getSignatureAlgoName(signAlgo: SignatureAlgorithm) {
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
