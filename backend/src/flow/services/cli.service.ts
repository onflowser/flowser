import { Injectable, Logger } from "@nestjs/common";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { ProjectContextLifecycle } from "../utils/project-context";
import { FlowCliOutput } from "../utils/cli-output";
import { ProjectEntity } from "../../projects/entities/project.entity";

@Injectable()
export class FlowCliService implements ProjectContextLifecycle {
  private readonly logger = new Logger(FlowCliService.name);
  private projectContext: ProjectEntity | undefined;
  public devWalletProcess: ChildProcessWithoutNullStreams;

  async onEnterProjectContext(project: ProjectEntity) {
    this.projectContext = project;
    await this.startDevWallet();
  }

  async onExitProjectContext() {
    this.projectContext = undefined;
    await this.stopDevWallet();
  }

  async getVersion() {
    const out = await this.execute("flow", ["version"]);
    return {
      version: out.findValue("version"),
      commitHash: out.findValue("commit"),
    };
  }

  async startDevWallet() {
    // TODO(milestone-3): only start if not yet running (e.g. by user)
    // TODO(milestone-3): Dynamically set emulator-host arg
    // TODO(milestone-3): Define a shared process manager service, that would also act as a central storage for retrieving all flow-cli/emulator logs?
    this.devWalletProcess = spawn(
      "flow",
      ["dev-wallet", "--emulator-host=http://localhost:8888"],
      {
        cwd: this.projectContext.filesystemPath,
      }
    );

    this.devWalletProcess.stdout.on("data", (data) => {
      const lines = data.toString().split("\n").filter(Boolean);
      lines.forEach((line) => {
        this.logger.debug(line);
      });
    });

    this.devWalletProcess.stderr.on("data", (data) => {
      this.logger.error(data.toString());
    });

    this.devWalletProcess.on("exit", (code) => {
      if (code !== 0) {
        this.logger.error(`dev-wallet exited with code ${code}`);
      }
    });
  }

  async stopDevWallet() {
    this.devWalletProcess?.kill();
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
