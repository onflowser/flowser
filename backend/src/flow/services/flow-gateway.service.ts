import {
    FlowAccount,
    FlowBlock,
    FlowCollection,
    FlowTransaction,
    FlowTransactionStatus
} from "../types";
import { GatewayConfigurationEntity } from "../../projects/entities/gateway-configuration.entity";
import { Injectable } from "@nestjs/common";
const fcl = require("@onflow/fcl");
import * as http from "http";

@Injectable()
export class FlowGatewayService {

    private configuration: GatewayConfigurationEntity;

    public configureDataSourceGateway(configuration: GatewayConfigurationEntity) {
        this.configuration = configuration;
        fcl.config().put("accessNode.api", this.url())
    }

    private url() {
        const host = `${this.configuration.address}:${this.configuration.port}`
        return host.startsWith("http") ? host : `http://${host}`;
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
        const collections = await this.fetchCollectionGuarantees(block);
        const txWithStatuses = await this.fetchTransactionsWithStatuses(collections);
        const transactions = txWithStatuses.map((tx: any) => {
            const {events, ...status} = tx.status;
            return {
                ...tx,
                status: {...status, eventsCount: tx.status.events.length}
            }
        })
        const events = txWithStatuses.map((tx: any) =>
          tx.status.events.map(event => ({transactionId: tx.id, ...event}))
        ).flat()
        return {
            block,
            collections,
            transactions,
            events
        }
    }

    private async fetchCollectionGuarantees(block: FlowBlock) {
        return Promise.all(
          block.collectionGuarantees.map(async guarantee => ({
              blockId: block.id,
              ...await this.getCollectionById(guarantee.collectionId)
          }))
        )
    }

    private async fetchTransactionsWithStatuses(collections: any[]) {
        const txIds = collections.map(collection => collection.transactionIds).flat();
        return await Promise.all(txIds.map(async txId => ({
            id: txId,
            ...await this.getTransactionById(txId)
        })))
    }

    public async getBlockDataWithinHeightRange(fromHeight, toHeight) {
        if (fromHeight === toHeight) return [];
        return Promise.all(
          Array.from({length: toHeight - fromHeight + 1})
            .map((_, i) => this.getBlockData(fromHeight + i))
        )
    }

    async isConnectedToGateway() {
        const {address, port} = this.configuration;
        return FlowGatewayService.isPingable(address, port);
    }

    static async isPingable(host: string, port: number): Promise<boolean> {
        return new Promise(resolve => {
            // must provide host without protocol prefix,
            // otherwise hostname will not be resolved and ENOTFOUND error will be thrown
            const req = http.get({
                host: host.replace(/http(s?):\/\//, ""),
                path: "/live",
                port,
            }, (res) => {
                req.end();
                return resolve(res.statusCode === 200);
            })
              .on("error", (error: any) => {
                  req.end();
                  if (error.code !== "ECONNREFUSED") {
                      console.log(`[Flowser] couldn't connect to flow emulator for unknown reason: `, error)
                  }
                  return resolve(false)
              })
            return true;
        })
    }
}
