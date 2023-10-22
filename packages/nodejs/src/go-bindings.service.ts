import { spawn } from "node:child_process";
import * as path from "path";
import * as os from "os";
import { ParsedInteractionOrError } from "@onflowser/api";

export interface GetParsedInteractionRequest {
  sourceCode: string;
}

export interface GetAddressIndexRequest {
  chainId: string;
  hexAddress: string;
}

type ExecuteGoBinRequest = {
  command: string;
  arguments: string[];
  stdIn?: string;
};

type ExecuteGoBinResponse = {
  raw: string;
};

type GoBindingsConfig = {
  // Path to the directory, which contains the compiled Go binding file(s).
  binDirPath: string;
}

export class GoBindingsService {
  private config: GoBindingsConfig;

  constructor(config: GoBindingsConfig) {
    this.config = config;
  }

  public async getParsedInteraction(
    request: GetParsedInteractionRequest
  ): Promise<ParsedInteractionOrError> {
    const response = await this.execute({
      command: "get-parsed-interaction",
      arguments: [],
      stdIn: request.sourceCode,
    });

    const parsedResponse = JSON.parse(response.raw);

    // Go code encodes the parameters as null when there is a parsing error.
    // Default to an empty array to match the expected structure.
    if (parsedResponse.interaction && parsedResponse.interaction.parameters === null) {
      parsedResponse.interaction.parameters = [];
    }

    return parsedResponse;
  }

  public async getIndexOfAddress(
    request: GetAddressIndexRequest
  ): Promise<number> {
    const response = await this.execute({
      command: "get-address-index",
      arguments: [request.chainId, request.hexAddress],
    });

    return Number(response.raw)
  }

  private execute(request: ExecuteGoBinRequest): Promise<ExecuteGoBinResponse> {
    return new Promise((resolve, reject) => {
      const childProcess = spawn(this.getExecutablePath(), [
        request.command,
        ...request.arguments,
      ]);

      let rawResponse = "";
      childProcess.stdout.on("data", (data) => {
        rawResponse += data.toString();
      });

      if (request.stdIn !== undefined) {
        childProcess.stdin.write(request.stdIn);
        // Write null char to signal the end of input.
        childProcess.stdin.write(new Uint8Array([0]));
      }

      childProcess.on("close", (code) => {
        if (code !== 0) {
          reject(`Go executable exited with code: ${code}`);
        } else {
          resolve({ raw: rawResponse });
        }
      });
    });
  }

  private getExecutablePath(): string {
    return path.join(this.config.binDirPath, this.getExecutableName())
  }

  private getExecutableName(): string {
    switch (os.platform()) {
      case "darwin":
        return "flowser-internal-amd64-darwin";
      case "linux":
        return "flowser-internal-amd64-linux";
      case "win32":
        return "flowser-internal-amd64.exe";
      default:
        throw new Error(`Unsupported platform: ${os.platform()}`);
    }
  }
}
