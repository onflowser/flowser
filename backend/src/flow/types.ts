import { AccountsStorage } from "../accounts/entities/storage.entity";

export type FlowCollectionGuarantee = {
  collectionId: string;
  signatures: string[];
};

export type FlowBlock = {
  id: string;
  parentId: string;
  height: number;
  timestamp: number;
  collectionGuarantees: FlowCollectionGuarantee[];
  blockSeals: any[];
  signatures: string[];
};

export type FlowKey = {
  index: number;
  publicKey: string;
  signAlgo: number;
  hashAlgo: number;
  weight: number;
  sequenceNumber: number;
  revoked: boolean;
};

export type FlowAccount = {
  address: string;
  balance: number;
  code: string;
  contracts: Map<string, string>;
  keys: FlowKey[];
  storage?: AccountsStorage;
};

export type FlowCollection = {
  id: string;
  transactionIds: string[];
};

export type FlowTransactionArgument = {
  type: string;
  value: any;
};

export type FlowTransactionProposalKey = {
  address: string;
  keyId: number;
  sequenceNumber: number;
};

export type FlowTransactionEnvelopeSignature = {
  address: string;
  keyId: number;
  signature: string;
};

export type FlowTransactionStatus = {
  status: number;
  statusCode: number;
  errorMessage: string;
  eventsCount: number;
};

export type FlowTransaction = {
  id: string;
  script: string;
  args: FlowTransactionArgument[];
  referenceBlockId: string;
  gasLimit: number;
  proposalKey: FlowTransactionProposalKey;
  payer: string; // payer account address
  authorizers: string[]; // authorizers account addresses
  envelopeSignatures: FlowTransactionEnvelopeSignature[];
};
