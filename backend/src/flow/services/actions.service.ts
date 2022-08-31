import { Injectable } from "@nestjs/common";
import { FlowCliService } from "./cli.service";

/**
 * This service should implement Flowser actions that trigger some events on the local emulator blockchain.
 *
 * Examples:
 * - create new account and add it to the flow.json config
 * - deploy a contract (defined in flow.json) to the local emulator blockchain
 */

@Injectable()
export class FlowActionsService {
  constructor(private readonly flowCliService: FlowCliService) {}

  // TODO(milestone-x): create new accounts from Flowser UI?
  async createAccount() {
    const keysOutput = await this.flowCliService.execute("flow", [
      "keys",
      "generate",
    ]);
    const privateKey = keysOutput.findValue("Private Key");
    const publicKey = keysOutput.findValue("Public Key");
    if (!privateKey) {
      throw new Error("Could not find generated private key");
    }
    if (!privateKey) {
      throw new Error("Could not find generated public key");
    }
    const accountOutput = await this.flowCliService.execute("flow", [
      "accounts",
      "create",
      "--key",
      publicKey,
    ]);
    return {
      address: accountOutput.findValue("address"),
      publicKey,
      privateKey,
    };
  }
}
