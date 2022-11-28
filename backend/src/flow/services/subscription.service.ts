import { Injectable, Logger } from "@nestjs/common";
import { FlowGatewayService, FlowTransactionStatus } from "./gateway.service";
import { TransactionsService } from "../../transactions/transactions.service";
import { TransactionStatus } from "@flowser/shared";

@Injectable()
export class FlowSubscriptionService {
  private logger = new Logger(FlowSubscriptionService.name);

  constructor(
    private readonly flowGatewayService: FlowGatewayService,
    private transactionService: TransactionsService
  ) {}

  public async addTransactionSubscription(transactionId: string) {
    const unsubscribe = await this.flowGatewayService
      .getTxStatusSubscription(transactionId)
      .subscribe((newStatus: FlowTransactionStatus) =>
        this.updateTransactionStatus(transactionId, newStatus)
      );
    try {
      await this.flowGatewayService
        .getTxStatusSubscription(transactionId)
        .onceSealed();
    } catch (e) {
      this.logger.debug(`Failed to wait on sealed transaction:`, e);
    } finally {
      // Once transaction is sealed, status won't change anymore.
      unsubscribe();
    }
  }

  private async updateTransactionStatus(
    transactionId: string,
    flowStatus: FlowTransactionStatus
  ) {
    return this.transactionService.updateStatus(
      transactionId,
      TransactionStatus.fromJSON({
        errorMessage: flowStatus.errorMessage,
        grcpStatus: flowStatus.statusCode,
        executionStatus: flowStatus.status,
      })
    );
  }
}
