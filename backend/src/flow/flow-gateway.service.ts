import {
    FlowAccount,
    FlowBlock,
    FlowCollection,
    FlowTransaction,
    FlowTransactionStatus
} from "./types";
import { GatewayConfigurationEntity } from "../projects/entities/gateway-configuration.entity";
import { Injectable } from "@nestjs/common";
const fcl = require("@onflow/fcl");
import fetch from "node-fetch";

@Injectable()
export class FlowGatewayService {

    private configuration: GatewayConfigurationEntity;

    public configureDataSourceGateway(configuration: GatewayConfigurationEntity) {
        this.configuration = configuration;
        fcl.config().put("accessNode.api", this.url())
    }

    private url() {
        return `${this.configuration.address}:${this.configuration.port}`
    }

    public async getLatestBlock (): Promise<FlowBlock> {
        return fcl.latestBlock();
    }

    public async getBlockByHeight (height: number): Promise<FlowBlock> {
        return fcl.send([
            fcl.getBlock(),
            fcl.atBlockHeight(height)
        ]).then(fcl.decode);
    }

    public async getCollectionById (id: string): Promise<FlowCollection> {
        return fcl.send([
            fcl.getCollection(id)
        ]).then(fcl.decode)
    }

    public async getTransactionById (id: string): Promise<{
      data: FlowTransaction,
      status: FlowTransactionStatus
    }> {
        const [data, status] = await Promise.all([
            fcl.send([fcl.getTransaction(id)]).then(fcl.decode),
            fcl.send([fcl.getTransactionStatus(id)]).then(fcl.decode)
        ])
        return {...data, status}
    }

    public async getAccount (address: string): Promise<FlowAccount> {
        return fcl.send([
            fcl.getAccount(address)
        ]).then(fcl.decode)
    }

    public async getBlockData (height) {
        const block = await this.getBlockByHeight(height);
        const collections = await Promise.all(
          block.collectionGuarantees.map(async guarantee => ({
              blockId: block.id,
              ...await this.getCollectionById(guarantee.collectionId)
          }))
        )
        const transactionsWithDetails = (await Promise.all(collections.map((collection: any) =>
          Promise.all(collection.transactionIds.map (async txId => ({
              id: txId,
              ...await this.getTransactionById(txId)
          })))
        ))).flat()
        const transactions = transactionsWithDetails.map((tx: any) => {
            const {events, ...status} = tx.status;
            return {
                ...tx,
                status: {...status, eventsCount: tx.status.events.length}
            }
        })
        const events = transactionsWithDetails.map((tx: any) =>
          tx.status.events.map(event => ({transactionId: tx.id, ...event}))
        ).flat()
        return {
            block,
            collections,
            transactions,
            events
        }
    }

    public async getBlockDataWithinHeightRange(fromHeight, toHeight) {
        if (fromHeight === toHeight) return [];
        return Promise.all(
          Array.from({length: toHeight - fromHeight + 1})
            .map((_, i) => this.getBlockData(fromHeight + i))
        )
    }

    async isConnectedToGateway(): Promise<boolean> {
        try {
            await fetch(this.url());
            return true;
        } catch (e) {
            return false;
        }
    }
}
