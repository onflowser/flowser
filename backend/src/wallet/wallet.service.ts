import { Injectable } from "@nestjs/common";
import { FlowConfigService } from "../flow/services/config.service";
import { ProcessManagerService } from "../processes/process-manager.service";
import { ec as EC } from "elliptic";
import { SHA3 } from "sha3";
import {
  FlowCliService,
  GeneratedAccount,
  GeneratedKey,
} from "../flow/services/cli.service";
import { AccountsService } from "../accounts/services/accounts.service";
import { AccountEntity } from "../accounts/entities/account.entity";
import { FlowAccount, FlowKey } from "../flow/services/gateway.service";
import { ensurePrefixedAddress } from "../utils";
import { AccountKeyEntity } from "../accounts/entities/key.entity";
const fcl = require("@onflow/fcl");

const ec: EC = new EC("p256");

@Injectable()
export class WalletService {
  constructor(
    private cliService: FlowCliService,
    private accountsService: AccountsService
  ) {}

  public async createAccount(): Promise<void> {
    // A user could choose to generate multiple keys for account.
    const keyPairs = await Promise.all([this.cliService.generateKey()]);
    const account = await this.cliService.createAccount(keyPairs);

    await this.accountsService.create(
      this.createAccountEntity(account, keyPairs)
    );
  }

  private createAccountEntity(
    generatedAccount: GeneratedAccount,
    generatedKeys: GeneratedKey[]
  ): AccountEntity {
    const account = new AccountEntity();
    account.address = ensurePrefixedAddress(generatedAccount.address);
    account.balance = 0;
    account.code = "";
    account.keys = generatedKeys.map((generatedKey) =>
      this.createKeyEntity(generatedAccount, generatedKey)
    );
    return account;
  }

  private createKeyEntity(
    generatedAccount: GeneratedAccount,
    generatedKey: GeneratedKey
  ) {
    const key = new AccountKeyEntity();
    key.index = generatedAccount.keys.findIndex(
      (key) => key === generatedKey.public
    );
    key.accountAddress = ensurePrefixedAddress(generatedAccount.address);
    // TODO(custom-wallet): Add `privateKey` field
    key.publicKey = generatedKey.public;
    // TODO(custom-wallet): Set default values for these below (or add KeySetting struct)
    // key.signAlgo = generatedKey.signAlgo;
    // key.hashAlgo = generatedKey.hashAlgo;
    // key.weight = generatedKey.weight;
    // key.sequenceNumber = generatedKey.sequenceNumber;
    // key.revoked = false;
    return key;
  }
}
