import { Injectable, Logger } from "@nestjs/common";
const fcl = require("@onflow/fcl");
import * as http from "http";
import { ProjectContextLifecycle } from "../utils/project-context";
import { ProjectEntity } from "../../projects/entities/project.entity";

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
  // TODO(milestone-3): why is "signatures" field not present in block response (fcl-js@1.0)?
  // See issue that I submitted: https://github.com/onflow/fcl-js/issues/1355
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

export type FlowCadenceObject = {
  type: string;
  // TODO: not sure about this, check the structure for more complex types
  value: string | FlowCadenceObject | FlowCadenceObject[];
};

// https://docs.onflow.org/fcl/reference/api/#proposalkeyobject
export type FlowProposalKey = {
  address: string;
  keyId: number;
  sequenceNumber: number;
};

// https://docs.onflow.org/fcl/reference/api/#signableobject
export type FlowSignableObject = {
  addr: string;
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
  args: FlowCadenceObject[];
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

@Injectable()
export class FlowGatewayService implements ProjectContextLifecycle {
  private static readonly logger = new Logger(FlowGatewayService.name);
  private projectContext: ProjectEntity | undefined;

  onEnterProjectContext(project: ProjectEntity): void {
    this.projectContext = project;
    if (this.projectContext?.gateway) {
      FlowGatewayService.logger.debug(
        `@onflow/fcl listening on ${this.getGatewayUrl()}`
      );
      // TODO: temp
      fcl.config().put("accessNode.api", "http://localhost:8888");
    }
  }
  onExitProjectContext(): void {
    this.projectContext = undefined;
  }

  private getGatewayUrl() {
    const { address, port } = this.projectContext?.gateway;
    const host = `${address}${port ? `:${port}` : ""}`;
    return host.startsWith("http") ? host : `http://${host}`;
  }

  public getTxStatusSubscription(transactionId: string) {
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
    return { ...account, address };
  }

  async isConnectedToGateway() {
    if (!this.projectContext?.gateway) {
      return false;
    }

    const { address, port } = this.projectContext?.gateway;
    return FlowGatewayService.isPingable(address, port);
  }

  static async isPingable(host: string, port: number): Promise<boolean> {
    return new Promise((resolve) => {
      // must provide host without protocol prefix,
      // otherwise hostname will not be resolved and ENOTFOUND error will be thrown
      const req = http
        .get(
          {
            host: host.replace(/http(s?):\/\//, ""),
            path: "/live",
            port,
          },
          (res) => {
            req.end();
            return resolve(res.statusCode === 200);
          }
        )
        .on("error", (err) => {
          req.end();
          return resolve(false);
        });
      return true;
    });
  }
}
