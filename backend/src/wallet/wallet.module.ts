import { Module } from "@nestjs/common";
import { FlowModule } from "../flow/flow.module";
import { AccountsModule } from "../accounts/accounts.module";
import { WalletController } from "./wallet.controller";
import { WalletService } from "./wallet.service";

@Module({
  imports: [FlowModule, AccountsModule],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
