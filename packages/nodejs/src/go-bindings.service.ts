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

export interface GetAddressIndexResponse {
  index: number;
}

type ExecuteGoBinRequest = {
  command: string;
  arguments: string[];
  stdIn?: string;
};

type ExecuteGoBinResponse = {
  raw: string;
};

export class GoBindingsService {
  public async getParsedInteraction(
    request: GetParsedInteractionRequest
  ): Promise<ParsedInteractionOrError> {
    const response = await this.execute({
      command: "get-parsed-interaction",
      arguments: [],
      stdIn: request.sourceCode,
    });

    return JSON.parse(response.raw);
  }

  public async getAddressIndex(
    request: GetAddressIndexRequest
  ): Promise<GetAddressIndexResponse> {
    const response = await this.execute({
      command: "get-address-index",
      arguments: [request.chainId, request.hexAddress],
    });

    return { index: Number(response.raw) };
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
          reject(`Interaction parser exited with code: ${code}`);
        } else {
          resolve({ raw: rawResponse });
        }
      });
    });
  }

  private getExecutablePath(): string {
    // When running this within electron env,
    // make sure to reference the executable in unpacked asar folder.
    // This is a hacky solution, but it's also the simplest one for now.
    // For more context, see:
    // - https://github.com/epsitec-sa/hazardous#what-is-the-real-purpose-of-asarunpacked
    // - https://github.com/electron/electron/issues/6262#issuecomment-273312942
    return path
      .join(__dirname, "bin", this.getExecutableName())
      .replace(`app.asar${path.sep}`, `app.asar.unpacked${path.sep}`);
  }

  private getExecutableName(): string {
    switch (os.platform()) {
      case "darwin":
        return "internal-amd64-darwin";
      case "linux":
        return "internal-amd64-linux";
      case "win32":
        return "internal-amd64.exe";
      default:
        throw new Error(`Unsupported platform: ${os.platform()}`);
    }
  }
}
