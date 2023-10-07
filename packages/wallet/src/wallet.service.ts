import {
  Injectable,
  PreconditionFailedException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { ec as EC } from "elliptic";
import { SHA3 } from "sha3";
import {
  FlowCliService,
  KeyWithWeight,
} from "@onflowser/core/src/flow/flow-cli.service";
import { AccountsService } from "../../../backend/src/accounts/services/accounts.service";
import { AccountEntity } from "../../../backend/src/accounts/entities/account.entity";
import { ensurePrefixedAddress } from "../../../backend/src/utils/common-utils";
import {
  AccountKeyEntity,
} from "../../../backend/src/accounts/entities/key.entity";
import { KeysService } from "../../../backend/src/accounts/services/keys.service";
import {
  FlowAuthorizationFunction,
  FlowGatewayService,
} from "@onflowser/core/src/flow/flow-gateway.service";
import { FlowConfigService } from "@onflowser/core/src/flow/flow-config.service";
import { FlowTransactionArgument } from "@flowser/packages/api";
import {
  FclArgumentWithMetadata,
  FclValues,
} from "@onflowser/core/src/flow/fcl-values";
const fcl = require("@onflow/fcl");

export interface SendTransactionRequest {
  cadence: string;
  /** Signer roles: https://developers.flow.com/concepts/start-here/transaction-signing#signer-roles */
  proposerAddress: string;
  payerAddress: string;
  authorizerAddresses: string[];
  arguments: FlowTransactionArgument[];
}

export interface SendTransactionResponse {
  transactionId: string;
}

type CreateAccountRequest = {
  projectRootPath: string;
};

const ec: EC = new EC("p256");

// https://developers.flow.com/tooling/flow-cli/accounts/create-accounts#key-weight
const defaultKeyWeight = 1000;

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly cliService: FlowCliService,
    private readonly flowGateway: FlowGatewayService,
    private readonly flowConfig: FlowConfigService,
    private readonly accountsService: AccountsService,
    private readonly keysService: KeysService
  ) {}

  public async sendTransaction(
    request: SendTransactionRequest
  ): Promise<SendTransactionResponse> {
    const uniqueRoleAddresses = new Set([
      request.proposerAddress,
      request.payerAddress,
      ...request.authorizerAddresses,
    ]);
    const authorizationFunctions = await Promise.all(
      Array.from(uniqueRoleAddresses).map(
        async (address): Promise<[string, FlowAuthorizationFunction]> => [
          address,
          await this.withAuthorization(address),
        ]
      )
    );

    function getAuthFunction(address: string) {
      const authFunction = authorizationFunctionsByAddress.get(address);
      if (authFunction === undefined) {
        throw new PreconditionFailedException(
          `Authorization function not found for: ${address}`
        );
      }
      return authFunction;
    }
    const authorizationFunctionsByAddress = new Map(authorizationFunctions);

    const fclArguments = request.arguments.map(
      (arg): FclArgumentWithMetadata => {
        const { identifier, type, valueAsJson } = arg;

        if (!type) {
          throw new Error("Expecting argument type");
        }

        const parsedValue = JSON.parse(valueAsJson);
        const value =
          parsedValue === "" && type.optional ? undefined : parsedValue;

        if (!FclValues.isFclValue(value)) {
          throw new Error("Value not a fcl value");
        }

        return {
          identifier,
          type,
          value,
        };
      }
    );

    return this.flowGateway.sendTransaction({
      cadence: request.cadence,
      proposer: getAuthFunction(request.proposerAddress),
      payer: getAuthFunction(request.payerAddress),
      authorizations: request.authorizerAddresses.map((address) =>
        getAuthFunction(address)
      ),
      arguments: fclArguments,
    });
  }

  // Returns undefined if provided account doesn't exist.
  private async withAuthorization(
    address: string
  ): Promise<FlowAuthorizationFunction> {
    let storedAccount;

    try {
      storedAccount = await this.accountsService.findOneWithRelationsByAddress(
        address
      );
    } catch (e) {
      console.error(e);
      throw new NotFoundException(`Account not found '${address}'`);
    }

    if (!storedAccount.keys) {
      throw new Error("Keys not loaded for account");
    }

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
      signingFunction: (signable: any) => {
        if (!credentialToUse.privateKey) {
          throw new Error("Private key not found");
        }
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

  public async importAccountsFromConfig() {
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
        keyEntity.privateKey = accountConfig.privateKey ?? "";

        const accountEntity = AccountEntity.createDefault();
        accountEntity.address = accountAddress;
        accountEntity.keys = [keyEntity];

        try {
          const isOnNetwork = await this.isAccountCreatedOnNetwork(
            accountAddress
          );

          if (!isOnNetwork) {
            // Ideally we could create this account on the blockchain, but:
            // - we would need to retrieve the public key from the private key we store in flow.json
            // - seems like flow team doesn't recommend doing this: https://github.com/onflow/flow-emulator/issues/405
            this.logger.debug(
              `Account ${accountAddress} is not created on the network, skipping import.`
            );
            return;
          }

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

  public async createAccount(
    options: CreateAccountRequest
  ): Promise<AccountEntity> {
    // For now, we only support a single key per account,
    // but we could as well add support for attaching
    // multiple keys with (possibly) different weights.
    const generatedKeyPairs = await Promise.all([
      this.cliService.generateKey({
        projectRootPath: options.projectRootPath,
      }),
    ]);
    const generatedAccount = await this.cliService.createAccount({
      projectRootPath: options.projectRootPath,
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

    // Assume only a single key per account for now
    const singlePrivateKey = accountEntity.keys[0].privateKey;
    if (!singlePrivateKey) {
      throw new Error("Private key not found");
    }

    // For now, we just write new accounts to flow.json,
    // but they don't get recreated on the next emulator run.
    // See: https://github.com/onflow/flow-emulator/issues/405
    await this.flowConfig.updateAccounts([
      {
        // TODO(custom-wallet): Come up with a human-readable name generation
        name: accountEntity.address,
        address: accountEntity.address,
        privateKey: singlePrivateKey,
      },
    ]);

    return accountEntity;
  }

  // Returns whether the account exists on the current blockchain.
  private async isAccountCreatedOnNetwork(address: string): Promise<boolean> {
    try {
      // Check if account is found on the blockchain.
      // Will throw if not found.
      await this.flowGateway.getAccount(address);
      return true;
    } catch (error: unknown) {
      const isNotFoundError = String(error).includes(
        "could not find account with address"
      );
      if (isNotFoundError) {
        return false;
      }

      throw error;
    }
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
