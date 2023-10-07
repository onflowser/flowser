// https://docs.onflow.org/cadence/language/crypto/#hashing
export enum SignatureAlgorithm {
  // Enum values must be kept unchanged.
  ECDSA_P256 = "ECDSA_P256",
  ECDSA_secp256k1 = "ECDSA_secp256k1",
  BLS_BLS12_381 = "BLS_BLS12_381",
}

// https://docs.onflow.org/cadence/language/crypto/#hashing
export enum HashAlgorithm {
  // Enum values must be kept unchanged.
  SHA2_256 = "SHA2_256",
  SHA2_384 = "SHA2_384",
  SHA3_256 = "SHA3_256",
  SHA3_384 = "SHA3_384",
  KMAC128_BLS_BLS12_381 = "KMAC128_BLS_BLS12_381",
  KECCAK_256 = "KECCAK_256",
}

export enum CadenceTypeKind {
  CADENCE_TYPE_UNKNOWN = 0,
  CADENCE_TYPE_FIXED_POINT_NUMBER = 1,
  CADENCE_TYPE_INTEGER_NUMBER = 2,
  CADENCE_TYPE_TEXTUAL = 3,
  CADENCE_TYPE_BOOLEAN = 4,
  CADENCE_TYPE_ADDRESS = 5,
  CADENCE_TYPE_ARRAY = 6,
  CADENCE_TYPE_DICTIONARY = 7,
  CADENCE_TYPE_PATH = 8,
}

export enum InteractionKind {
  INTERACTION_SCRIPT = 1,
  INTERACTION_TRANSACTION = 2,
}

export interface CadenceInteraction {
  kind: InteractionKind;
  parameters: CadenceParameter[];
  transaction: CadenceInteraction_Transaction | undefined;
}

export interface CadenceInteraction_Transaction {
  /**
   * Number of authorizers, specified in prepare statement.
   * https://developers.flow.com/concepts/start-here/transaction-signing
   */
  authorizerCount: number;
}

export interface CadenceParameter {
  identifier: string;
  type: CadenceType | undefined;
}

export interface CadenceType {
  kind: CadenceTypeKind;
  rawType: string;
  optional: boolean;
  array: CadenceType_Array | undefined;
  dictionary: CadenceType_Dictionary | undefined;
}

export interface CadenceType_Array {
  element: CadenceType | undefined;
  size: number;
}

export interface CadenceType_Dictionary {
  key: CadenceType | undefined;
  value: CadenceType | undefined;
}
