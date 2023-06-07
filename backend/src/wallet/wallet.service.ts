import { Injectable } from "@nestjs/common";
import { ec as EC } from "elliptic";
import { SHA3 } from "sha3";
import {
  FlowCliService,
  GeneratedAccount,
  GeneratedKey,
} from "../flow/services/cli.service";
import { AccountsService } from "../accounts/services/accounts.service";
import { AccountEntity } from "../accounts/entities/account.entity";
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

  // Implements fcl authorization function:
  // https://developers.flow.com/next/tooling/fcl-js/api#authorization-function
  public async authorizeAccount(fclAccount: Record<string, unknown> = {}) {
    const address = fclAccount.addr as string;

    const storedAccount = await this.accountsService.findOneByAddress(address);

    const keyToUse = storedAccount.keys[0];

    if (!keyToUse) {
      throw new Error(`Account ${address} has no keys`);
    }

    if (!keyToUse.privateKey) {
      throw new Error(`Account ${address} has no private key`);
    }

    return {
      ...fclAccount,
      tempId: `${address}-${keyToUse.index}`,
      addr: fcl.sansPrefix(address),
      keyId: keyToUse.index,
      signingFunction: (signable) => {
        return {
          addr: fcl.withPrefix(address),
          keyId: keyToUse.index,
          signature: this.signWithPrivateKey(
            keyToUse.privateKey,
            signable.message
          ),
        };
      },
    };
  }

  private signWithPrivateKey(privateKey: string, message: string) {
    const key = ec.keyFromPrivate(Buffer.from(privateKey, "hex"));
    const sig = key.sign(this.hashMessage(message));
    const n = 32;
    const r = sig.r.toArrayLike(Buffer, "be", n);
    const s = sig.s.toArrayLike(Buffer, "be", n);
    return Buffer.concat([r, s]).toString("hex");
  }

  private hashMessage(msg: string) {
    const sha = new SHA3(256);
    sha.update(Buffer.from(msg, "hex"));
    return sha.digest();
  }
}
