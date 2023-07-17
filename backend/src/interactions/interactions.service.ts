import { Injectable } from "@nestjs/common";
import {
  GetParsedInteractionRequest,
  GetParsedInteractionResponse,
} from "@flowser/shared";
import { spawn } from "node:child_process";
import * as path from "path";

@Injectable()
export class InteractionsService {
  public async parse(
    request: GetParsedInteractionRequest
  ): Promise<GetParsedInteractionResponse> {
    const rawResponse = await this.execute(request.sourceCode);

    console.log(rawResponse);

    return GetParsedInteractionResponse.fromJSON(JSON.parse(rawResponse));
  }

  private execute(sourceCode: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const childProcess = spawn(path.join(__dirname, "bin/parser"));

      let rawResponse = "";
      childProcess.stdout.on("data", (data) => {
        rawResponse += data.toString();
      });

      childProcess.stdin.write(sourceCode);
      childProcess.stdin.write("\n");

      childProcess.on("close", (code) => {
        if (code !== 0) {
          reject(`Interaction parser exited with code: ${code}`);
        } else {
          resolve(rawResponse);
        }
      });
    });
  }
}
