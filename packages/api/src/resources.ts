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

export interface PollingResource {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | undefined;
}

export interface IdentifiableResource {
  id: string;
}

export interface BlockScopedResource {
  blockId: string;
}

export interface FlowAccount {
  // ID is equal to the address.
  id: string;
  address: string;
  blockId: string;
  balance: number;
  code: string;
  isDefaultAccount: boolean;
  keys: FlowAccountKey[];
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

export interface FlowAccountKey {
  id: string;
  index: number;
  accountAddress: string;
  blockId: string;
  publicKey: string;
  privateKey: string;
  signAlgo: SignatureAlgorithm | undefined;
  hashAlgo: HashAlgorithm | undefined;
  weight: number;
  sequenceNumber: number;
  revoked: boolean;
}

export interface FlowContract {
  // ID is the combination of `address` and `name`.
  id: string;
  address: string;
  name: string;
  blockId: string;
  code: string;
}

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
export enum AccountStorageDomain {
  STORAGE_DOMAIN_PRIVATE = 1,
  STORAGE_DOMAIN_PUBLIC = 2,
  STORAGE_DOMAIN_STORAGE = 3,
}

export interface FlowAccountStorage {
  id: string;
  address: string;
  domain: AccountStorageDomain;
  // TODO(restructure): Split data into multiple type-specific fields
  data: any;
  path: string;
  targetPath: string;
}

export interface FlowBlock {
  id: string;
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

export interface FlowTransaction {
  id: string;
  script: string;
  blockId: string;
  referenceBlockId: string;
  gasLimit: number;
  payer: string;
  proposalKey: TransactionProposalKey;
  status: TransactionStatus;
  arguments: FlowTransactionArgument[];
  authorizers: string[];
  envelopeSignatures: SignableObject[];
  payloadSignatures: SignableObject[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionProposalKey {
  address: string;
  keyId: number;
  sequenceNumber: number;
}

export interface FlowTransactionArgument {
  identifier: string;
  type: CadenceType | undefined;
  valueAsJson: string;
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

export interface FlowEvent {
  // ID is the combination of `transactionId` and `eventIndex`.
  id: string;
  transactionId: string;
  blockId: string;
  eventIndex: number;
  type: string;
  transactionIndex: number;
  data: object;
}

export interface FlowStateSnapshot {
  id: string;
  description: string;
  blockId: string;
  projectId: string;
}

export interface ManagedProcess {
  id: string;
  name: string;
  command: CommandOptions | undefined;
  state: ManagedProcessState;
  output: ManagedProcessOutput[];
  createdAt: string;
  updatedAt: string;
}

export enum ManagedProcessState {
  MANAGED_PROCESS_STATE_UNSPECIFIED = 0,
  MANAGED_PROCESS_STATE_NOT_RUNNING = 1,
  MANAGED_PROCESS_STATE_RUNNING = 2,
  MANAGED_PROCESS_STATE_ERROR = 3,
  UNRECOGNIZED = -1,
}

export interface CommandOptions {
  name: string;
  args: string[];
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
  OUTPUT_SOURCE_UNSPECIFIED = 0,
  OUTPUT_SOURCE_STDOUT = 1,
  OUTPUT_SOURCE_STDERR = 2,
  UNRECOGNIZED = -1,
}
