import { Body, Controller, Post } from "@nestjs/common";
import { WalletService } from "./wallet.service";
import {
  SendTransactionRequest,
  SendTransactionResponse,
} from "@flowser/shared/dist/src/generated/api/wallet";

@Controller("wallets")
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post("accounts/transaction")
  async sendTransaction(@Body() body: unknown) {
    const request = SendTransactionRequest.fromJSON(body);
    const response = await this.walletService.sendTransaction(request);
    return SendTransactionResponse.toJSON(response);
  }

  @Post("accounts")
  async createAccount() {
    return this.walletService.createAccount();
    // FIXME: Got Unimplemented cadence type: {"value":[],"type":"Dictionary"} error here
    // account.toProto();
  }
}
