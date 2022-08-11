import { Injectable } from "@nestjs/common";
import {
  FlowGatewayService,
  FlowTransactionStatus,
} from "./flow-gateway.service";
import { TransactionsService } from "../../transactions/transactions.service";
import { TransactionStatus } from "@flowser/types/generated/entities/transactions";

@Injectable()
export class FlowSubscriptionService {
  constructor(
    private readonly flowGatewayService: FlowGatewayService,
    private transactionService: TransactionsService
  ) {}

  public async addTransactionSubscription(transactionId: string) {
    const unsubscribe = await this.flowGatewayService
      .getTxStatusSubscription(transactionId)
      .subscribe((newStatus) =>
        this.updateTransactionStatus(transactionId, newStatus)
      );
    await this.flowGatewayService
      .getTxStatusSubscription(transactionId)
      .onceSealed();

    // Once transaction is sealed, status won't change anymore.
    unsubscribe();
  }

  private async updateTransactionStatus(
    transactionId: string,
    status: FlowTransactionStatus
  ) {
    return this.transactionService.updateStatus(
      transactionId,
      TransactionStatus.fromJSON(status)
    );
  }
}
