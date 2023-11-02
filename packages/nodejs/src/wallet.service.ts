import { ec as EC } from "elliptic";
import { SHA3 } from "sha3";
import { FlowCliService } from "./flow-cli.service";
import { ensurePrefixedAddress } from "@onflowser/core";
import { FlowAuthorizationFunction, FlowGatewayService } from "@onflowser/core";
import { FclArgumentWithMetadata } from "@onflowser/api";
import { PersistentStorage } from "@onflowser/core/src/persistent-storage";

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

export type ManagedKeyPair = {
  address: string;
  publicKey: string;
  privateKey: string;
};

// TODO(restructure-followup): Should we import existing accounts from flow.json?
export class WalletService {
  constructor(
    private readonly cliService: FlowCliService,
    private readonly flowGateway: FlowGatewayService,
    private readonly storageService: PersistentStorage,
  ) {}

  public async sendTransaction(
    request: SendTransactionRequest,
  ): Promise<SendTransactionResponse> {
    const uniqueRoleAddresses = new Set([
      request.proposerAddress,
      request.payerAddress,
      ...request.authorizerAddresses,
    ]);
    const managedKeyPairs = await this.listKeyPairs();
    const authorizationFunctions = await Promise.all(
      Array.from(uniqueRoleAddresses).map(
        async (address): Promise<[string, FlowAuthorizationFunction]> => [
          address,
          await this.withAuthorization({ address, managedKeyPairs }),
        ],
      ),
    );

    function getAuthFunction(address: string) {
      const authFunction = authorizationFunctionsByAddress.get(address);
      if (authFunction === undefined) {
        throw new Error(`Authorization function not found for: ${address}`);
      }
      return authFunction;
    }
    const authorizationFunctionsByAddress = new Map(authorizationFunctions);

    return this.flowGateway.sendTransaction({
      cadence: request.cadence,
      proposer: getAuthFunction(request.proposerAddress),
      payer: getAuthFunction(request.payerAddress),
      authorizations: request.authorizerAddresses.map((address) =>
        getAuthFunction(address),
      ),
      arguments: request.arguments,
    });
  }

  // Returns undefined if provided account doesn't exist.
  private async withAuthorization(options: {
    address: string;
    managedKeyPairs: ManagedKeyPair[];
  }): Promise<FlowAuthorizationFunction> {
    const { address, managedKeyPairs } = options;
    const managedKeyPairsOfAccount = managedKeyPairs.filter(
      (e) => e.address === address,
    );

    if (managedKeyPairsOfAccount.length === 0) {
      throw new Error(`Private keys not found for account: ${address}`);
    }

    const managedKeyToUse = managedKeyPairsOfAccount[0];

    const account = await this.flowGateway.getAccount(address);
    const associatedPublicKey = account.keys.find(
      (key) => key.publicKey === managedKeyToUse.publicKey,
    );

    if (!associatedPublicKey) {
      throw new Error(
        `Associated public key not found for account: ${account}`,
      );
    }

    const authn: FlowAuthorizationFunction = (
      fclAccount: Record<string, unknown> = {},
    ) => ({
      ...fclAccount,
      tempId: `${address}-${managedKeyToUse.privateKey}`,
      addr: fcl.sansPrefix(address),
      keyId: associatedPublicKey.index,
      signingFunction: (signable: any) => {
        if (!managedKeyToUse.privateKey) {
          throw new Error("Private key not found");
        }
        return {
          addr: fcl.withPrefix(address),
          keyId: associatedPublicKey.index,
          signature: this.signWithPrivateKey(
            managedKeyToUse.privateKey,
            signable.message,
          ),
        };
      },
    });

    return authn;
  }

  public async synchronizeIndex() {
    const managedKeyPairs = await this.listKeyPairs();
    const associatedAccounts = await Promise.allSettled(
      managedKeyPairs.map((keyPair) =>
        this.flowGateway.getAccount(keyPair.address),
      ),
    );
    const validKeyPairLookupByPublicKey = new Set(
      associatedAccounts
        .map((account) => {
          if (account.status === "fulfilled") {
            return account.value.keys.map((key) => key.publicKey);
          } else {
            return [];
          }
        })
        .flat(),
    );
    await this.writeKeyPairs(
      managedKeyPairs.filter((keyPair) =>
        validKeyPairLookupByPublicKey.has(keyPair.publicKey),
      ),
    );
  }

  public async createAccount(options: CreateAccountRequest): Promise<void> {
    const generatedKeyPair = await this.cliService.generateKey({
      projectRootPath: options.workspacePath,
    });
    const generatedAccount = await this.cliService.createAccount({
      projectRootPath: options.workspacePath,
      keys: [
        {
          weight: defaultKeyWeight,
          publicKey: generatedKeyPair.public,
        },
      ],
    });

    const existingKeyPairs = await this.listKeyPairs();
    await this.writeKeyPairs([
      ...existingKeyPairs,
      {
        address: ensurePrefixedAddress(generatedAccount.address),
        privateKey: generatedKeyPair.private,
        publicKey: generatedKeyPair.public,
      },
    ]);
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

  public async listKeyPairs() {
    const data = await this.storageService.read();
    return JSON.parse(data ?? "[]") as ManagedKeyPair[];
  }

  private async writeKeyPairs(keyPairs: ManagedKeyPair[]) {
    await this.storageService.write(JSON.stringify(keyPairs));
  }
}
