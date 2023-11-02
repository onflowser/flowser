import { FclValue } from "@onflowser/core";

export type InteractionDefinition = {
  id: string;
  name: string;
  code: string;
  fclValuesByIdentifier: FclValueLookupByIdentifier;
  initialOutcome: InteractionOutcome | undefined;
  transactionOptions: TransactionOptions | undefined;
  createdDate: Date;
  updatedDate: Date;
};

export type FclValueLookupByIdentifier = Map<string, FclValue>;

export type TransactionOptions = {
  authorizerAddresses: string[];
  proposerAddress: string;
  payerAddress: string;
};

export type InteractionOutcome = {
  transaction?: TransactionOutcome;
  script?: ScriptOutcome;
};

export type TransactionOutcome = {
  transactionId?: string;
  error?: string;
};

export type ScriptOutcome = {
  result?: unknown;
  error?: string;
};
