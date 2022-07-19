import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { Injectable, Logger } from "@nestjs/common";
import { FlowCliService } from "./flow-cli.service";
import { AccountsStorage } from "../../accounts/entities/storage.entity";
import config from "../../config";
import axios from "axios";

@Injectable()
export class StorageDataService {
  private dataStorageProcess: ChildProcessWithoutNullStreams;
  private readonly logger = new Logger(StorageDataService.name);
  private data: string[] = [];

  constructor(private flowCliConfig: FlowCliService) {}

  async start() {
    this.logger.debug(
      `Starting process in ${this.flowCliConfig.projectDirPath}...`
    );

    return new Promise((resolve, reject) => {
      try {
        // main_linux_x86_64 executable file is available in PATH
        this.dataStorageProcess = spawn("main_linux_x86_64", [], {
          cwd: this.flowCliConfig.projectDirPath,
          env: {
            // env defaults to process.env, but here we are overriding the defaults
            // therefore we need to explicitly set all the required env vars
            FLOW_STORAGE_SERVER_PORT: `${config.storageServerPort}`,
            PATH: process.env.PATH, // main_linux_x86_64 is present in path
          },
        });
      } catch (e) {
        const message = `Storage data error: ${e.message}`;
        reject(message);
      }

      this.dataStorageProcess.stdout.on("data", (stdout) => {
        if (stdout) {
          // persist stdout for debugging info
          this.data.push(...stdout.toString().split("\n").filter(Boolean));
        }

        // process will emit "Storage server error" when server fails to start
        const error = this.findLog("Storage server error");
        if (error) {
          return reject(new Error(error));
        }
        // process will emit "Storage server started" when server starts successfully
        if (this.findLog("Storage server started")) {
          resolve(true);
        }
      });

      this.dataStorageProcess.on("exit", (code, signal) => {
        this.logger.error(`Storage server exited: ${code} (${signal})`);
        this.printStdout();
        reject("Unexpected storage server error: " + signal);
      });

      this.dataStorageProcess.on("close", (code, signal) => {
        this.logger.error(`Storage server closed: ${code} (${signal})`);
        this.printStdout();
        reject("Unexpected storage server error: " + signal);
      });

      this.dataStorageProcess.on("error", (error) => {
        this.logger.error(
          `Storage server error: ${error.message}`,
          error.stack
        );
        this.printStdout();
        reject("Storage server error: " + error.message);
      });
    });
  }

  stop(): void {
    try {
      this.logger.debug("Stopping storage server");
      this.dataStorageProcess?.kill(); // send SIGTERM signal
    } catch (e) {
      this.logger.error(`Failed to stop: ${e.message}`, e.stack);
    }
  }

  async getStorageData(account: string): Promise<AccountsStorage> {
    account = account.indexOf("0x") === 0 ? account.substr(2) : account;
    let response;
    try {
      response = await axios.get(
        `http://localhost:${config.storageServerPort}/storage`
      );
    } catch (e) {
      this.logger.error(`Error fetching storage: ${e.message}`, e.stack);
      this.printStdout();
      throw e;
    }
    if (!response?.data) {
      this.logger.debug(`Empty storage response`);
    }
    const storage = response?.data || {};
    return account in storage ? storage[account] : [];
  }

  findLog(query) {
    // traverse the most recent logs first (start from the end)
    for (let i = this.data.length - 1; i >= 0; i--) {
      const line = this.data[i];
      if (line.toLowerCase().includes(query.toLowerCase())) {
        // a log match is found
        return line;
      }
    }
    return null;
  }

  private printStdout() {
    if (this.data.length > 0) {
      this.logger.debug("Storage server stdout: ");
      console.log(this.data.join("\n"));
    }
  }
}
