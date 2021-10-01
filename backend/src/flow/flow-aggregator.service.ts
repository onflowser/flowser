import { Injectable } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import { FlowGatewayService } from "./flow-gateway.service";
import { BlocksService } from "../blocks/blocks.service";
import config from "../config";
import { TransactionsService } from "../transactions/transactions.service";
import { AccountsService } from "../accounts/accounts.service";
import { ContractsService } from "../contracts/contracts.service";
import { EventsService } from "../events/events.service";

@Injectable()
export class FlowAggregatorService {

  constructor (
    private flowGatewayService: FlowGatewayService,
    private blockService: BlocksService,
    private transactionService: TransactionsService,
    private accountService: AccountsService,
    private contractService: ContractsService,
    private eventService: EventsService
  ) {}

  @Interval(config.dataFetchInterval)
  async fetchDataFromDataSource(): Promise<void> {
    try {
      const lastStoredBlock = await this.blockService.findLastBlock();
      const latestBlock = await this.flowGatewayService.getLatestBlock();
      // fetch from initial block if no stored blocks found
      const startBlockHeight = lastStoredBlock ? lastStoredBlock.height : 0;
      const endBlockHeight = latestBlock.height;
      console.log(`[Flowser] block range: ${startBlockHeight} - ${endBlockHeight}`)
      const data = await this.flowGatewayService.getBlockDataWithinHeightRange(
        startBlockHeight,
        endBlockHeight
      );
      await Promise.all(data.map(({ block }) => (
        this.blockService.create(block)
      )))
      await Promise.all(data.map(({ transactions }) => (
        Promise.all(transactions.map(tx => this.transactionService.create(tx)))
      )))
      // TODO: iterate over events and trigger additional actions for events of interest (e.g. "flow.AccountCreated")
    } catch (e) {
      console.error(`[Flowser] block fetch error: ${e}`)
    }
  }

}
