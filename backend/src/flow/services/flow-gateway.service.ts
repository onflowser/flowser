import { GatewayConfigurationEntity } from "../../projects/entities/gateway-configuration.entity";
import { Injectable, Logger } from "@nestjs/common";
const fcl = require("@onflow/fcl");
import * as http from "http";
import { AccountsStorageEntity } from "../../accounts/entities/storage.entity";

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
  contracts: Record<string, string>;
  keys: FlowKey[];
  storage?: AccountsStorageEntity;
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
  events: FlowEvent[];
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

export type FlowEvent = {
  transactionId: string;
  type: string;
  transactionIndex: number;
  eventIndex: number;
  data: Record<string, any>;
};

@Injectable()
export class FlowGatewayService {
  private configuration: GatewayConfigurationEntity;
  private static readonly logger = new Logger(FlowGatewayService.name);

  public configureDataSourceGateway(configuration: GatewayConfigurationEntity) {
    this.configuration = configuration;
    FlowGatewayService.logger.debug(
      `@onflow/fcl listening on ${this.configuration?.url()}`
    );
    fcl.config().put("accessNode.api", this.configuration?.url());
  }

  public async getLatestBlock(): Promise<FlowBlock> {
    return fcl.latestBlock();
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
    if (!this.configuration) {
      return false;
    }

    const { address, port } = this.configuration;
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
