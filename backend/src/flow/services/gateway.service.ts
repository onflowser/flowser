import { Injectable, Logger } from "@nestjs/common";
import * as http from "http";
import { ProjectContextLifecycle } from "../utils/project-context";
import { ProjectEntity } from "../../projects/entities/project.entity";
import {
  Gateway,
  GatewayStatus,
} from "@flowser/types/generated/entities/projects";

const fcl = require("@onflow/fcl");

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

// TODO(milestone-3): We should probably rename that object to FlowTransactionArgument
// This kind of structure seems to be specific to how transaction arguments are encoded in Flow
// Transaction arguments are not represented by CadenceValue object in flow-go-sdk source:
// https://github.com/onflow/flow-emulator/blob/3fbe8ad9dc841abdc13056e20e7b15fc0e32a749/accountStorage.go#L77-L83
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
      const accessNodeUrl = this.projectContext.gateway.restServerAddress;
      FlowGatewayService.logger.debug(
        `@onflow/fcl listening on ${accessNodeUrl}`
      );
      fcl.config().put("accessNode.api", accessNodeUrl);
    }
  }
  onExitProjectContext(): void {
    this.projectContext = undefined;
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

    const gatewayStatus = await FlowGatewayService.getGatewayStatus(
      this.projectContext.gateway
    );

    return gatewayStatus === GatewayStatus.GATEWAY_STATUS_ONLINE;
  }

  static async getGatewayStatus(gateway: Gateway): Promise<GatewayStatus> {
    const { hostname, port } = new URL(gateway.restServerAddress);
    return new Promise((resolve) => {
      const req = http
        .get(
          {
            host: hostname,
            path: "/live",
            port,
          },
          (res) => {
            req.end();
            return resolve(
              res.statusCode === 200
                ? GatewayStatus.GATEWAY_STATUS_ONLINE
                : GatewayStatus.GATEWAY_STATUS_UNKNOWN
            );
          }
        )
        .on("error", (err) => {
          req.end();
          return resolve(GatewayStatus.GATEWAY_STATUS_OFFLINE);
        });
      return true;
    });
  }
}
