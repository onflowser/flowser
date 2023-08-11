import {
  SendTransactionRequest,
  SendTransactionResponse,
} from "@flowser/shared";
import { TransportService } from "./transports/transport.service";

export class WalletService {
  constructor(private readonly transport: TransportService) {}

  sendTransaction(
    request: SendTransactionRequest
  ): Promise<SendTransactionResponse> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: "/api/wallets/accounts/transaction",
      requestData: request,
      requestProtobuf: SendTransactionRequest,
      responseProtobuf: SendTransactionResponse,
    });
  }

  createAccount(): Promise<void> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: "/api/wallets/accounts",
    });
  }
}
