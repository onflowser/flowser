import { Injectable, Logger } from "@nestjs/common";
import { spawn } from "child_process";
import { ProjectContext } from "../utils/project-context";
import { FlowCliOutput } from "../utils/cli-output";

@Injectable()
export class FlowCliService extends ProjectContext {
  private readonly logger = new Logger(FlowCliService.name);

  async version() {
    const out = await this.execute("flow", ["version"]);
    return {
      version: out.findValue("version"),
      commitHash: out.findValue("commit"),
    };
  }

  async execute(bin = "", args): Promise<FlowCliOutput> {
    if (!bin) {
      throw new Error("Provide a command");
    }
    this.logger.debug(`executing command: ${bin} ${args.join(" ")}`);
    return new Promise((resolve, reject) => {
      let out = "";
      const process = spawn(bin, args, {
        cwd: this.projectContext?.filesystemPath,
      });

      process.stdout.on("data", (data) => {
        out += data.toString();
      });

      process.stderr.on("data", (data) => {
        out += data.toString();
      });

      process.on("exit", (code) =>
        code === 0 ? resolve(new FlowCliOutput(out)) : reject(out)
      );
    });
  }
}
