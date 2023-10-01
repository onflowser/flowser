import {
  CollectionGuarantee,
  HashAlgorithm,
  SignatureAlgorithm,
} from "@flowser/shared";

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
  address: string;
  blockId: string;
  balance: number;
  code: string;
  isDefaultAccount: boolean;
}

export interface FlowAccountKey {
  index: number;
  accountAddress: string;
  blockId: string;
  publicKey: string;
  privateKey: string;
  signAlgo: SignatureAlgorithm;
  hashAlgo: HashAlgorithm;
  weight: number;
  sequenceNumber: number;
  revoked: boolean;
}

export interface FlowContract {
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

export interface FlowAccountStorage {
  address: string;
  path: string;
  type: unknown;
}

export interface FlowBlock {
  blockId: string;
  parentId: string;
  blockHeight: number;
  timestamp: Date;
  collectionGuarantees: CollectionGuarantee[];
  blockSeals: any[];
  signatures: string[];
}

export interface FlowTransaction {
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
