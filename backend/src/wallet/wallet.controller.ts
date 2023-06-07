import { Controller, Param, Post } from "@nestjs/common";
import { WalletService } from "./wallet.service";

@Controller("wallets")
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post("accounts/:address/transaction")
  async sendTransaction(@Param("address") address) {
    return this.walletService.sendTransaction(address);
  }

  @Post("accounts")
  async createAccount() {
    return this.walletService.createAccount();
    // TODO(custom-wallet): Got Unimplemented cadence type: {"value":[],"type":"Dictionary"} error here
    // account.toProto();
  }
}
