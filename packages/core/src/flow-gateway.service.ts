import {
  FclArgBuilder,
  FclTypeLookup, FclValue,
  FclValueUtils
} from "./fcl-value";
import * as fcl from "@onflow/fcl";
import axios from "axios";
import { FclArgumentWithMetadata } from "@onflowser/api";

// https://docs.onflow.org/fcl/reference/api/#collectionguaranteeobject
export type FlowCollectionGuarantee = {
  collectionId: string;
  signatures: string[];
};

// https://docs.onflow.org/fcl/reference/api/#blockobject
export type FlowBlock = {
  id: string;
  parentId: string;
  height: number;
  timestamp: number;
  collectionGuarantees: FlowCollectionGuarantee[];
  blockSeals: any[];
  // TODO(milestone-x): "signatures" field is not present in block response
  // https://github.com/onflow/fcl-js/issues/1355
  signatures: string[];
};

// https://docs.onflow.org/fcl/reference/api/#keyobject
export type FlowKey = {
  index: number;
  publicKey: string;
  signAlgo: number;
  hashAlgo: number;
  weight: number;
  sequenceNumber: number;
  revoked: boolean;
};

// https://docs.onflow.org/fcl/reference/api/#accountobject
export type FlowAccount = {
  address: string;
  balance: number;
  code: string;
  contracts: Record<string, string>;
  keys: FlowKey[];
};

// https://docs.onflow.org/fcl/reference/api/#collectionobject
export type FlowCollection = {
  id: string;
  transactionIds: string[];
};

export type FlowTypeAnnotatedValue = {
  // https://developers.flow.com/tooling/fcl-js/api#ftype
  type: string;
  value: FclValue;
};

// https://docs.onflow.org/fcl/reference/api/#proposalkeyobject
export type FlowProposalKey = {
  address: string;
  keyId: number;
  sequenceNumber: number;
};

// https://docs.onflow.org/fcl/reference/api/#signableobject
export type FlowSignableObject = {
  address: string;
  keyId: number;
  signature: string;
};

// https://docs.onflow.org/fcl/reference/api/#transactionstatusobject
export type FlowTransactionStatus = {
  status: number;
  statusCode: number;
  errorMessage: string;
  events: FlowEvent[];
};

// https://docs.onflow.org/fcl/reference/api/#transactionobject
export type FlowTransaction = {
  id: string;
  script: string;
  args: FlowTypeAnnotatedValue[];
  referenceBlockId: string;
  gasLimit: number;
  proposalKey: FlowProposalKey;
  payer: string; // payer account address
  authorizers: string[]; // authorizers account addresses
  envelopeSignatures: FlowSignableObject[];
  payloadSignatures: FlowSignableObject[];
};

// https://docs.onflow.org/fcl/reference/api/#event-object
export type FlowEvent = {
  transactionId: string;
  type: string;
  transactionIndex: number;
  eventIndex: number;
  // Data contains arbitrary key-value pairs emitted from transactions.
  // Information about cadence types is not returned from fcl-js.
  data: Record<string, any>;
};

// https://developers.flow.com/next/tooling/fcl-js/api#authorization-function
export type FlowAuthorizationFunction = () => unknown;

type SendFlowTransactionOptions = {
  cadence: string;
  proposer: FlowAuthorizationFunction;
  payer: FlowAuthorizationFunction;
  authorizations: FlowAuthorizationFunction[];
  arguments: FclArgumentWithMetadata[];
};

type ExecuteFlowScriptOptions = {
  cadence: string;
  arguments: FclArgumentWithMetadata[];
};

type FlowTxUnsubscribe = () => void;

type FlowTxStatusCallback = (status: FlowTransactionStatus) => void;

type FlowTxSubscribe = (callback: FlowTxStatusCallback) => FlowTxUnsubscribe;

// https://developers.flow.com/tooling/fcl-js/api#returns-19
type FlowTxStatusSubscription = {
  subscribe: FlowTxSubscribe;
  onceFinalized: () => Promise<void>;
  onceExecuted: () => Promise<void>;
  onceSealed: () => Promise<void>;
};

type FlowGatewayConfig = {
  restServerAddress: string;
  flowJSON: unknown;
};

export enum FlowApiStatus {
  SERVICE_STATUS_ONLINE = 1,
  SERVICE_STATUS_OFFLINE = 2,
}

export class FlowGatewayService {
  public configure(config: FlowGatewayConfig): void {
    fcl
      .config({
        "accessNode.api": config.restServerAddress,
        "flow.network": "emulator",
      })
      .load({
        flowJSON: config.flowJSON,
      });
  }

  public async executeScript<Result>(options: ExecuteFlowScriptOptions): Promise<Result> {
    return await fcl.query({
      cadence: options.cadence,
      args: (arg: FclArgBuilder, t: FclTypeLookup) => {
        const argumentFunction = FclValueUtils.getArgumentFunction(
          options.arguments
        );
        return argumentFunction(arg, t);
      },
    });
  }

  /**
   * Sends the transaction and returns the transaction ID.
   *
   * https://developers.flow.com/tooling/fcl-js/transactions
   */
  public async sendTransaction(
    options: SendFlowTransactionOptions
  ): Promise<{ transactionId: string }> {
    const transactionId = await fcl.mutate({
      cadence: options.cadence,
      args: (arg: FclArgBuilder, t: FclTypeLookup) => {
        const argumentFunction = FclValueUtils.getArgumentFunction(
          options.arguments
        );
        return argumentFunction(arg, t);
      },
      proposer: options.proposer,
      authorizations: options.authorizations,
      payer: options.payer,
      limit: 9999,
    });

    return { transactionId };
  }

  public getTxStatusSubscription(
    transactionId: string
  ): FlowTxStatusSubscription {
    return fcl.tx(transactionId);
  }

  public async getLatestBlock(): Promise<FlowBlock> {
    return fcl
      .send([
        fcl.getBlock(true), // Get latest sealed block
      ])
      .then(fcl.decode);
  }

  public async getBlockByHeight(height: number): Promise<FlowBlock> {
    return fcl
      .send([fcl.getBlock(), fcl.atBlockHeight(height)])
      .then(fcl.decode);
  }

  public async getCollectionById(id: string): Promise<FlowCollection> {
    return fcl.send([fcl.getCollection(id)]).then(fcl.decode);
  }

  public async getTransactionById(id: string): Promise<FlowTransaction> {
    const transaction = await fcl
      .send([fcl.getTransaction(id)])
      .then(fcl.decode);
    return { ...transaction, id };
  }

  public async getTransactionStatusById(
    transactionId: string
  ): Promise<FlowTransactionStatus> {
    return fcl.send([fcl.getTransactionStatus(transactionId)]).then(fcl.decode);
  }

  public async getAccount(address: string): Promise<FlowAccount> {
    const account = await fcl.send([fcl.getAccount(address)]).then(fcl.decode);
    // https://developers.flow.com/tools/fcl-js/reference/api#accountobject
    return { ...account, balance: account.balance / Math.pow(10, 8), address };
  }

  public async getApiStatus(): Promise<FlowApiStatus> {
    const restServerUrl = await fcl.config.get("accessNode.api");

    if (!restServerUrl) {
      throw new Error("accessNode.api not configured");
    }

    try {
      await axios.request({
        method: "GET",
        url: restServerUrl,
        // Prevent axios from throwing on certain http response codes
        // https://github.com/axios/axios/issues/41
        validateStatus: () => true,
      });
      // Assume that if response is received, server is online
      // Ideally we should send a ping request to access API
      // but that endpoint isn't implemented on emulator side (afaik)
      // https://github.com/onflow/flow/blob/master/protobuf/flow/access/access.proto#L20
      return FlowApiStatus.SERVICE_STATUS_ONLINE;
    } catch (error) {
      return FlowApiStatus.SERVICE_STATUS_OFFLINE;
    }
  }
}
