import { Injectable, PreconditionFailedException } from "@nestjs/common";
import { ec as EC } from "elliptic";
import { SHA3 } from "sha3";
import {
  FlowCliService,
  CreatedAccount,
  GeneratedKey,
  KeyWithWeight,
} from "../flow/services/cli.service";
import { AccountsService } from "../accounts/services/accounts.service";
import { AccountEntity } from "../accounts/entities/account.entity";
import { ensurePrefixedAddress } from "../utils";
import { AccountKeyEntity } from "../accounts/entities/key.entity";
import { KeysService } from "../accounts/services/keys.service";
import { FlowEmulatorService } from "../flow/services/emulator.service";
import {
  FlowAuthorizationFunction,
  FlowGatewayService,
} from "../flow/services/gateway.service";
import {
  SignatureAlgorithm,
  SendTransactionRequest,
  SendTransactionResponse,
} from "@flowser/shared";
const fcl = require("@onflow/fcl");

const ec: EC = new EC("p256");

// https://developers.flow.com/tooling/flow-cli/accounts/create-accounts#key-weight
const defaultKeyWeight = 1000;
// https://developers.flow.com/tooling/flow-cli/accounts/create-accounts#public-key-signature-algorithm
const defaultSignatureAlgorithm = SignatureAlgorithm.ECDSA_P256;

@Injectable()
export class WalletService {
  constructor(
    private readonly cliService: FlowCliService,
    private readonly flowGateway: FlowGatewayService,
    private readonly accountsService: AccountsService,
    private readonly keysService: KeysService
  ) {}

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

  public async createAccount(): Promise<AccountEntity> {
    // For now, we only support a single key per account,
    // but we could as well add support for attaching
    // multiple keys with (possibly) different weights.
    const keyPairs = await Promise.all([this.cliService.generateKey()]);
    const account = await this.cliService.createAccount({
      keys: keyPairs.map(
        (key): KeyWithWeight => ({
          weight: defaultKeyWeight,
          publicKey: key.public,
        })
      ),
    });
    const accountEntity = this.createAccountEntity(account, keyPairs);

    await this.accountsService.create(accountEntity);
    await this.keysService.updateAccountKeys(
      accountEntity.address,
      accountEntity.keys
    );

    return accountEntity;
  }

  private createAccountEntity(
    generatedAccount: CreatedAccount,
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
    generatedAccount: CreatedAccount,
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
    key.signAlgo = defaultSignatureAlgorithm;
    // Which has algorithm is actually used here by default?
    // Flow CLI doesn't support the option to specify it as an argument,
    // nor does it return this info when generating the key.
    key.hashAlgo = defaultSettings.serviceHashAlgorithm;
    key.weight = defaultKeyWeight;
    key.sequenceNumber = 0;
    key.revoked = false;
    return key;
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
