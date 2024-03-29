import { FclValue } from "@onflowser/core";

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
  INTERACTION_UNKNOWN = 0,
  INTERACTION_SCRIPT = 1,
  INTERACTION_TRANSACTION = 2,
}

export interface ParsedInteractionOrError {
  interaction: ParsedInteraction | undefined;
  program: { [key: string]: any } | undefined;
  error: string;
}

export interface ParsedInteraction {
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
  type: CadenceType;
}

export interface TimestampedResource {
  createdAt: Date;
  updatedAt: Date;
}

export interface IdentifiableResource {
  id: string;
}

export interface FlowAccount extends TimestampedResource, IdentifiableResource {
  // ID is equal to the address.
  id: string;
  address: string;
  balance: number;
  code: string;
  tags: FlowAccountTag[];
}

export interface FlowAccountTag {
  name: string;
  description: string;
}

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

export interface FlowAccountKey
  extends TimestampedResource,
    IdentifiableResource {
  id: string;
  index: number;
  address: string;
  publicKey: string;
  signAlgo: SignatureAlgorithm | undefined;
  hashAlgo: HashAlgorithm | undefined;
  weight: number;
  sequenceNumber: number;
  revoked: boolean;
}

export type ManagedKeyPair = {
  address: string;
  publicKey: string;
  privateKey: string;
};

export interface FlowContract
  extends TimestampedResource,
    IdentifiableResource {
  // ID is the combination of `address` and `name`.
  id: string;
  address: string;
  name: string;
  code: string;
}

// TODO(restructure-followup): Refactor FlowAccountStorage
export interface FlowAccountCapability {
  address: string;
  path: string;
  type: unknown;
  targetPath: string;
}

/**
 * Every account storage path consists of a domain and identifier: /<domain>/<identifier>
 * See official docs: https://developers.flow.com/cadence/language/accounts#paths
 */
export enum FlowStorageDomain {
  STORAGE_DOMAIN_PRIVATE = 1,
  STORAGE_DOMAIN_PUBLIC = 2,
  STORAGE_DOMAIN_STORAGE = 3,
}

export interface FlowAccountStorage
  extends TimestampedResource,
    IdentifiableResource {
  id: string;
  address: string;
  domain: FlowStorageDomain;
  // TODO(restructure-followup): Split data into multiple type-specific fields
  data: any;
  path: string;
  targetPath: string;
}

export interface FlowBlock extends TimestampedResource, IdentifiableResource {
  id: string;
  height: number;
  parentId: string;
  blockHeight: number;
  timestamp: Date;
  collectionGuarantees: CollectionGuarantee[];
  blockSeals: any[];
  signatures: string[];
}

export interface CollectionGuarantee {
  collectionId: string;
  signatures: string[];
}

export interface FlowTransaction extends TimestampedResource {
  id: string;
  script: string;
  blockId: string;
  referenceBlockId: string;
  gasLimit: number;
  payer: string;
  proposalKey: TransactionProposalKey;
  status: TransactionStatus;
  arguments: FclArgumentWithMetadata[];
  authorizers: string[];
  envelopeSignatures: SignableObject[];
  payloadSignatures: SignableObject[];
}

export interface TransactionProposalKey {
  address: string;
  keyId: number;
  sequenceNumber: number;
}

export interface FclArgumentWithMetadata {
  identifier: string;
  value: FclValue;
  type: CadenceType;
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

export interface SignableObject {
  address: string;
  keyId: number;
  signature: string;
}

export interface TransactionStatus {
  executionStatus: ExecutionStatusCode;
  grcpStatus: GrcpStatusCode;
  errorMessage: string;
}

/** https://github.com/onflow/flow-go/issues/4494#issuecomment-1601995168 */
export enum GrcpStatusCode {
  GRCP_STATUS_OK = 0,
  GRCP_STATUS_FAILED = 1,
  UNRECOGNIZED = -1,
}

/** https://docs.onflow.org/fcl/reference/api/#transaction-statuses */
export enum ExecutionStatusCode {
  EXECUTION_STATUS_UNKNOWN = 0,
  /** EXECUTION_STATUS_PENDING - Transaction Pending - Awaiting Finalization */
  EXECUTION_STATUS_PENDING = 1,
  /** EXECUTION_STATUS_FINALIZED - Transaction Finalized - Awaiting Execution */
  EXECUTION_STATUS_FINALIZED = 2,
  /** EXECUTION_STATUS_EXECUTED - Transaction Executed - Awaiting Sealing */
  EXECUTION_STATUS_EXECUTED = 3,
  /**
   * EXECUTION_STATUS_SEALED - Transaction Sealed - Transaction Complete. At this point the transaction
   * result has been committed to the blockchain.
   */
  EXECUTION_STATUS_SEALED = 4,
  /** EXECUTION_STATUS_EXPIRED - Transaction Expired */
  EXECUTION_STATUS_EXPIRED = 5,
}

export interface FlowEvent extends TimestampedResource {
  // ID is the combination of `transactionId` and `eventIndex`.
  id: string;
  transactionId: string;
  eventIndex: number;
  type: string;
  transactionIndex: number;
  data: object;
}

export interface FlowStateSnapshot {
  id: string;
  blockId: string;
  blockHeight: number;
}

export interface ManagedProcess {
  id: string;
  name: string;
  command: CommandOptions | undefined;
  state: ManagedProcessState;
  createdAt: Date;
  updatedAt: Date;
}

export enum ManagedProcessState {
  NOT_RUNNING = 1,
  RUNNING = 2,
  ERROR = 3,
}

export interface CommandOptions {
  name: string;
  args?: string[];
}

export interface ManagedProcessOutput {
  id: string;
  processId: string;
  data: string;
  source: ProcessOutputSource;
  createdAt: string;
  updatedAt: string;
}

export enum ProcessOutputSource {
  OUTPUT_SOURCE_STDOUT = 1,
  OUTPUT_SOURCE_STDERR = 2,
}

export interface FlowserWorkspace extends TimestampedResource {
  id: string;
  name: string;
  filesystemPath: string;
  emulator: FlowEmulatorConfig | undefined;
}

export interface FlowEmulatorConfig {
  verboseLogging: boolean;
  logFormat: string;
  restServerPort: number;
  grpcServerPort: number;
  adminServerPort: number;
  blockTime: number;
  servicePrivateKey: string;
  databasePath: string;
  tokenSupply: number;
  transactionExpiry: number;
  storagePerFlow: number;
  minAccountBalance: number;
  transactionMaxGasLimit: number;
  scriptGasLimit: number;
  serviceSignatureAlgorithm: SignatureAlgorithm;
  serviceHashAlgorithm: HashAlgorithm;
  storageLimit: boolean;
  transactionFees: boolean;
  persist: boolean;
  withContracts: boolean;
  enableGrpcDebug: boolean;
  enableRestDebug: boolean;
  useSimpleAddresses: boolean;
  snapshot: boolean;
}

export interface WorkspaceTemplate extends TimestampedResource {
  id: string;
  name: string;
  code: string;
  filePath: string;
}

export interface FlowCliInfo {
  version: string;
}
