import {
  Injectable,
  PreconditionFailedException,
  Logger,
} from "@nestjs/common";
import { ec as EC } from "elliptic";
import { SHA3 } from "sha3";
import { FlowCliService, KeyWithWeight } from "../flow/services/cli.service";
import { AccountsService } from "../accounts/services/accounts.service";
import { AccountEntity } from "../accounts/entities/account.entity";
import { ensurePrefixedAddress } from "../utils";
import {
  AccountKeyEntity,
  defaultKeyWeight,
} from "../accounts/entities/key.entity";
import { KeysService } from "../accounts/services/keys.service";
import {
  FlowAuthorizationFunction,
  FlowGatewayService,
} from "../flow/services/gateway.service";
import {
  SendTransactionRequest,
  SendTransactionResponse,
} from "@flowser/shared";
import { FlowConfigService } from "../flow/services/config.service";
import { ProjectContextLifecycle } from "../flow/utils/project-context";
import { ProjectEntity } from "src/projects/project.entity";
const fcl = require("@onflow/fcl");

const ec: EC = new EC("p256");

@Injectable()
export class WalletService implements ProjectContextLifecycle {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly cliService: FlowCliService,
    private readonly flowGateway: FlowGatewayService,
    private readonly flowConfig: FlowConfigService,
    private readonly accountsService: AccountsService,
    private readonly keysService: KeysService
  ) {}

  async onEnterProjectContext(project: ProjectEntity): Promise<void> {
    // TODO(snapshots-revamp): Re-import accounts when emulator state changes?
    await this.importAccountsFromConfig();
  }

  async onExitProjectContext(): Promise<void> {
    // Nothing to do here
  }

  public async sendTransaction(
    request: SendTransactionRequest
  ): Promise<SendTransactionResponse> {
    const [proposer, payer, authorizations] = await Promise.all([
      this.withAuthorization(request.proposerAddress),
      this.withAuthorization(request.payerAddress),
      Promise.all(
        request.authorizerAddresses.map((authorizerAddress) =>
          this.withAuthorization(authorizerAddress)
        )
      ),
    ]);

    return this.flowGateway.sendTransaction({
      cadence: request.cadence,
      proposer,
      payer,
      authorizations,
    });
  }

  private async withAuthorization(address: string) {
    const storedAccount = await this.accountsService.findOneByAddress(address);

    const credentialsWithPrivateKeys = storedAccount.keys.filter((key) =>
      Boolean(key.privateKey)
    );
    const isManagedAccount = credentialsWithPrivateKeys.length > 0;

    if (!isManagedAccount) {
      throw new PreconditionFailedException(
        `Authorizer account ${address} isn't managed by Flowser.`,
        "Flowser doesn't store private keys of the provided account."
      );
    }

    const credentialToUse = credentialsWithPrivateKeys[0];

    const authn: FlowAuthorizationFunction = (
      fclAccount: Record<string, unknown> = {}
    ) => ({
      ...fclAccount,
      tempId: `${address}-${credentialToUse.index}`,
      addr: fcl.sansPrefix(address),
      keyId: credentialToUse.index,
      signingFunction: (signable) => {
        return {
          addr: fcl.withPrefix(address),
          keyId: credentialToUse.index,
          signature: this.signWithPrivateKey(
            credentialToUse.privateKey,
            signable.message
          ),
        };
      },
    });

    return authn;
  }

  private async importAccountsFromConfig() {
    const accountsConfig = this.flowConfig.getAccounts();
    await Promise.all(
      accountsConfig.map(async (accountConfig) => {
        const accountAddress = ensurePrefixedAddress(accountConfig.address);

        const keyEntity = AccountKeyEntity.createDefault();
        keyEntity.index = 0;
        keyEntity.accountAddress = accountAddress;
        // Public key is not stored in flow.json,
        // so just use empty value for now.
        // This should be updated by the aggregator service once it's picked up.
        keyEntity.publicKey = "";
        keyEntity.privateKey = accountConfig.privateKey;

        const accountEntity = AccountEntity.createDefault();
        accountEntity.address = accountAddress;
        accountEntity.keys = [keyEntity];

        try {
          // Check if account is found on the blockchain.
          // Will throw if not found.
          await this.flowGateway.getAccount(accountAddress);

          await this.accountsService.upsert(accountEntity);
          await this.keysService.updateAccountKeys(
            accountEntity.address,
            accountEntity.keys
          );
        } catch (e) {
          // Ignore
          this.logger.debug("Managed account import failed", e);
        }
      })
    );
  }

  // TODO(snapshots-revamp): I think that persisting all managed accounts to flow.json
  //  would solve most of our issues with necessary managed account deletion when jumping to snapshots.
  public async createAccount(): Promise<AccountEntity> {
    // For now, we only support a single key per account,
    // but we could as well add support for attaching
    // multiple keys with (possibly) different weights.
    const generatedKeyPairs = await Promise.all([
      this.cliService.generateKey(),
    ]);
    const generatedAccount = await this.cliService.createAccount({
      keys: generatedKeyPairs.map(
        (key): KeyWithWeight => ({
          weight: defaultKeyWeight,
          publicKey: key.public,
        })
      ),
    });
    const accountEntity = AccountEntity.createDefault();
    accountEntity.address = ensurePrefixedAddress(generatedAccount.address);
    accountEntity.keys = generatedKeyPairs.map((generatedKey) => {
      const key = AccountKeyEntity.createDefault();
      key.accountAddress = accountEntity.address;
      key.index = generatedAccount.keys.findIndex(
        (key) => key === generatedKey.public
      );
      key.publicKey = generatedKey.public;
      key.privateKey = generatedKey.private;
      return key;
    });

    await this.accountsService.upsert(accountEntity);
    await this.keysService.updateAccountKeys(
      accountEntity.address,
      accountEntity.keys
    );

    await this.flowConfig.updateAccounts([
      {
        name: accountEntity.address,
        address: accountEntity.address,
        // Assume only a single key per account for now
        privateKey: accountEntity.keys[0].privateKey,
      },
    ]);

    return accountEntity;
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
