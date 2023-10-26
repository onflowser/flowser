import { ec as EC } from "elliptic";
import { SHA3 } from "sha3";
import { FlowCliService, KeyWithWeight } from "./flow-cli.service";
import { ensurePrefixedAddress, IFlowserLogger } from "@onflowser/core";
import {
  FlowAuthorizationFunction,
  FlowGatewayService,
} from "@onflowser/core";
import * as flowserResource from "@onflowser/api";
import {
  FlowAccountKey,
  FlowAccount,
  HashAlgorithm,
  IResourceIndex,
  SignatureAlgorithm, FclArgumentWithMetadata
} from "@onflowser/api";
import { FlowConfigService } from "./flow-config.service";

const fcl = require("@onflow/fcl");

export interface SendTransactionRequest {
  cadence: string;
  /** Signer roles: https://developers.flow.com/concepts/start-here/transaction-signing#signer-roles */
  proposerAddress: string;
  payerAddress: string;
  authorizerAddresses: string[];
  arguments: FclArgumentWithMetadata[];
}

export interface SendTransactionResponse {
  transactionId: string;
}

type CreateAccountRequest = {
  workspacePath: string;
};

const ec: EC = new EC("p256");

// https://developers.flow.com/tooling/flow-cli/accounts/create-accounts#key-weight
const defaultKeyWeight = 1000;

export class WalletService {

  constructor(
    private readonly logger: IFlowserLogger,
    private readonly cliService: FlowCliService,
    private readonly flowGateway: FlowGatewayService,
    private readonly flowConfig: FlowConfigService,
    private accountIndex: IResourceIndex<flowserResource.FlowAccount>
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
        throw new Error(
          `Authorization function not found for: ${address}`
        );
      }
      return authFunction;
    }
    const authorizationFunctionsByAddress = new Map(authorizationFunctions);

    return this.flowGateway.sendTransaction({
      cadence: request.cadence,
      proposer: getAuthFunction(request.proposerAddress),
      payer: getAuthFunction(request.payerAddress),
      authorizations: request.authorizerAddresses.map((address) =>
        getAuthFunction(address)
      ),
      arguments: request.arguments,
    });
  }

  // Returns undefined if provided account doesn't exist.
  private async withAuthorization(
    address: string
  ): Promise<FlowAuthorizationFunction> {
    const storedAccount = await this.accountIndex.findOneById(address);

    if (!storedAccount) {
      throw new Error("Account not found")
    }

    if (storedAccount.keys.length === 0) {
      throw new Error("Keys not loaded for account");
    }

    const credentialsWithPrivateKeys = storedAccount.keys.filter((key) =>
      Boolean(key.privateKey)
    );
    const isManagedAccount = credentialsWithPrivateKeys.length > 0;

    if (!isManagedAccount) {
      throw new Error(
        `Authorizer account ${address} isn't managed by Flowser.`
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

        const key: FlowAccountKey = {
          ...this.createDefaultKey(accountAddress),
          privateKey: accountConfig.privateKey,
        };

        const account: FlowAccount = {
          ...this.createDefaultAccount(accountAddress),
          // TODO(restructure): Add logic for generating tags
          // https://github.com/onflowser/flowser/pull/197/files#diff-de96e521dbe8391acff7b4c46768d9f51d90d5e30378600a41a57d14bb173f75L97-L116
          keys: [key],
        };

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

          await this.accountIndex.add(account);
        } catch (e: unknown) {
          this.logger.error("Managed account import failed", e);
        }
      })
    );
  }

  public async createAccount(options: CreateAccountRequest): Promise<void> {
    // For now, we only support a single key per account,
    // but we could as well add support for attaching
    // multiple keys with (possibly) different weights.
    const generatedKeyPairs = await Promise.all([
      this.cliService.generateKey({
        projectRootPath: options.workspacePath,
      }),
    ]);
    const generatedAccount = await this.cliService.createAccount({
      projectRootPath: options.workspacePath,
      keys: generatedKeyPairs.map(
        (key): KeyWithWeight => ({
          weight: defaultKeyWeight,
          publicKey: key.public,
        })
      ),
    });
    const accountAddress = ensurePrefixedAddress(generatedAccount.address);

    await this.accountIndex.add({
      ...this.createDefaultAccount(accountAddress),
      keys: generatedKeyPairs.map((generatedKey) => {
        return {
          ...this.createDefaultKey(accountAddress),
          index: generatedAccount.keys.findIndex(
            (key) => key === generatedKey.public
          ),
          publicKey: generatedKey.public,
          privateKey: generatedKey.private,
        };
      })
    });
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

  private createDefaultKey(accountAddress: string): FlowAccountKey {
    const keyIndex = 0;
    return {
      // TODO(restructure): Define util functions for generating IDs / initializing resources?
      id: `${accountAddress}.${keyIndex}`,
      index: 0,
      accountAddress,
      blockId: "NULL",
      // Public key is not stored in flow.json,
      // so just use empty value for now.
      // This should be updated by the aggregator service once it's picked up.
      publicKey: "",
      privateKey: "",
      signAlgo: SignatureAlgorithm.ECDSA_P256,
      hashAlgo: HashAlgorithm.SHA2_256,
      weight: 1000,
      sequenceNumber: 0,
      revoked: false,
    };
  }

  private createDefaultAccount(address: string): FlowAccount {
    return {
      id: address,
      address,
      balance: 0,
      blockId: "",
      code: "",
      createdAt: new Date(),
      deletedAt: undefined,
      isDefaultAccount: false,
      keys: [],
      tags: [],
      updatedAt: new Date(),
    };
  }
}
