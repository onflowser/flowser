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
import { KeysService } from "../accounts/services/keys.service";
import { FlowEmulatorService } from "../flow/services/emulator.service";
const fcl = require("@onflow/fcl");

const ec: EC = new EC("p256");

@Injectable()
export class WalletService {
  constructor(
    private readonly cliService: FlowCliService,
    private readonly accountsService: AccountsService,
    private readonly keysService: KeysService
  ) {}

  public async sendTransaction(address: string): Promise<void> {
    const authn = this.withAuthorization(address);

    const response = await fcl.mutate({
      cadence: `transaction {}`,
      args: (_arg, _t) => [],
      proposer: [authn],
      authorizations: [authn],
      payer: [authn],
      limit: 9999,
    });

    return await fcl.tx(response).onceSealed();
  }

  public async createAccount(): Promise<AccountEntity> {
    // A user could choose to generate multiple keys for account.
    const keyPairs = await Promise.all([this.cliService.generateKey()]);
    const account = await this.cliService.createAccount(keyPairs);
    const accountEntity = this.createAccountEntity(account, keyPairs);

    await this.accountsService.create(accountEntity);
    await this.keysService.updateAccountKeys(
      accountEntity.address,
      accountEntity.keys
    );

    return accountEntity;
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
    const defaultSettings = FlowEmulatorService.getDefaultFlags();

    const key = new AccountKeyEntity();
    key.index = generatedAccount.keys.findIndex(
      (key) => key === generatedKey.public
    );
    key.accountAddress = ensurePrefixedAddress(generatedAccount.address);
    key.publicKey = generatedKey.public;
    key.privateKey = generatedKey.private;
    // TODO(custom-wallet): For now use default settings, but maybe we should have a "GenerateKeyOptions" struct
    key.signAlgo = defaultSettings.serviceSignatureAlgorithm;
    key.hashAlgo = defaultSettings.serviceHashAlgorithm;
    key.weight = 1;
    key.sequenceNumber = 0;
    key.revoked = false;
    return key;
  }

  public async withAuthorization(address: string) {
    const storedAccount = await this.accountsService.findOneByAddress(address);

    // TODO(custom-wallet): This won't have a private key on it,
    //  because I believe it gets overwritten in aggregator service
    const keyToUse = storedAccount.keys[0];

    if (!keyToUse) {
      throw new Error(`Account ${address} has no keys`);
    }

    if (!keyToUse.privateKey) {
      throw new Error(`Account ${address} has no private key`);
    }

    // Implements fcl authorization function:
    // https://developers.flow.com/next/tooling/fcl-js/api#authorization-function
    const authorizationCallback = (
      fclAccount: Record<string, unknown> = {}
    ) => ({
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
    });

    // Called by fcl in the callers scope.
    return authorizationCallback;
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
