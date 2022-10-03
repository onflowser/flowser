import { Injectable } from "@nestjs/common";
import { FlowGatewayService, FlowTransactionStatus } from "./gateway.service";
import { TransactionsService } from "../../transactions/transactions.service";

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
    flowStatus: FlowTransactionStatus
  ) {
    return this.transactionService.updateStatus(transactionId, {
      errorMessage: flowStatus.errorMessage,
      grcpStatus: flowStatus.statusCode,
      executionStatus: flowStatus.status,
    });
  }
}
