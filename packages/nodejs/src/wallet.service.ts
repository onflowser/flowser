import { ec as EC } from "elliptic";
import { SHA3 } from "sha3";
import { FlowCliService } from "./flow-cli.service";
import { ensurePrefixedAddress } from "@onflowser/core";
import {
  FlowAuthorizationFunction,
  FlowGatewayService,
} from "@onflowser/core";
import * as flowserResource from "@onflowser/api";
import {
  HashAlgorithm,
  IResourceIndex,
  SignatureAlgorithm, FclArgumentWithMetadata
} from "@onflowser/api";

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

// TODO(restructure): Should we import existing accounts from flow.json?
export class WalletService {

  constructor(
    private readonly cliService: FlowCliService,
    private readonly flowGateway: FlowGatewayService,
    private accountKeysIndex: IResourceIndex<flowserResource.FlowAccountKey>
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
    const allKeys = await this.accountKeysIndex.findAll();
    const accountPrivateKeys = allKeys.filter(key => Boolean(key.privateKey));

    if (accountPrivateKeys.length === 0) {
      throw new Error(`Private keys not found for account: ${address}`);
    }

    const credentialToUse = accountPrivateKeys[0];

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

  public async createAccount(options: CreateAccountRequest): Promise<void> {
    const signatureAlgorithm = SignatureAlgorithm.ECDSA_P256;
    const hashAlgorithm = HashAlgorithm.SHA2_256;
    const generatedKeyPair = await this.cliService.generateKey({
      projectRootPath: options.workspacePath,
      signatureAlgorithm,
    });
    const generatedAccount = await this.cliService.createAccount({
      projectRootPath: options.workspacePath,
      keys: [
        {
          weight: defaultKeyWeight,
          publicKey: generatedKeyPair.public,
        }
      ],
    });
    const accountAddress = ensurePrefixedAddress(generatedAccount.address);

    await this.accountKeysIndex.create({
      address: accountAddress,
      hashAlgo: hashAlgorithm,
      // TODO(restructure): Reuse the same function as in indexer service
      id: `${accountAddress}.${generatedKeyPair.public}`,
      index: 0,
      privateKey: generatedKeyPair.private,
      publicKey: generatedKeyPair.public,
      revoked: false,
      sequenceNumber: 0,
      signAlgo: signatureAlgorithm,
      weight: 1000,
    })
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
