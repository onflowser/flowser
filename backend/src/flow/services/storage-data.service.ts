import { ChildProcessWithoutNullStreams, exec, spawn } from "child_process";
import { Injectable, Logger } from "@nestjs/common";
import { FlowCliService } from "./flow-cli.service";
import { AccountsStorage } from '../../accounts/entities/storage.entity';
import axios from 'axios';

@Injectable()
export class StorageDataService {

    private dataStorageProcess: ChildProcessWithoutNullStreams;
    private readonly logger = new Logger(StorageDataService.name);

    constructor (private flowCliConfig: FlowCliService) {
    }

    async start () {
        this.logger.debug(`Starting process in ${this.flowCliConfig.projectDirPath}...`);

        return new Promise(((resolve, reject) => {
            try {
                this.dataStorageProcess = spawn("main_linux_x86_64", [], {
                    cwd: this.flowCliConfig.projectDirPath,
                });
                this.dataStorageProcess.stdout.on("data", stdout => {
                    const findLine = (pattern, std) => std
                        ? std.toString()
                            .split("\n")
                            .filter(l => l.includes(pattern))[0]
                        : null;
                    // process will emit "Storage server error" when server fails to start
                    const error = findLine("Storage server error", stdout)
                    if (error) {
                        return reject(new Error(error))
                    }
                    // process will emit "Storage server started" when server starts successfully
                    if (findLine("Storage server started", stdout)) {
                        resolve(true);
                    }
                })
                this.dataStorageProcess.on("exit", code => reject(code))
            } catch (e) {
                const message = `Storage data error: ${e.message}`;
                reject(message);
            }

            this.dataStorageProcess.on("close", code => {
                this.logger.debug('Storage server exit code:', code);
            })

            this.dataStorageProcess.on("error", error => {
                this.logger.error(`Storage server error: ${error.message}`, error.stack);
            })
        }))
    }

    stop(): void {
        try {
            this.dataStorageProcess?.kill();
        } catch (e) {
            this.logger.error(`Failed to stop: ${e.message}`, e.stack)
        }
    }

    async getStorageData(account: string): Promise<AccountsStorage> {
        account = account.indexOf('0x') === 0 ? account.substr(2) : account;
        // TODO: Resource url
        let response;
        try {
            // TODO: Improve once Data storage will be configurable
            response = await axios.get('http://backend:8888/storage')
        } catch (e) {
            this.logger.error(`Error fetching storage: ${e.message}`, e.stack);
        }
        const storage = response?.data || {};
        return account in storage ? storage[account] : [];
    }
}
