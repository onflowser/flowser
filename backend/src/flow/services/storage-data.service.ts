import { ChildProcessWithoutNullStreams, exec, spawn } from "child_process";
import { Injectable } from "@nestjs/common";
import { FlowCliService } from "./flow-cli.service";
import { AccountsStorage } from '../../accounts/entities/storage.entity';
import axios from 'axios';

@Injectable()
export class StorageDataService {

    private dataStorageProcess: ChildProcessWithoutNullStreams;
    constructor (private flowCliConfig: FlowCliService) {
    }

    async start () {
        const flowDbPath: string = this.flowCliConfig.databaseDirPath;
        console.log(`[Flowser] starting data storage process`);
        console.log(`[Flowser] expecting flow database to be inside ${flowDbPath} directory`)

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
                console.log('data storage process exit code:', code);
            })

            this.dataStorageProcess.on("error", error => {
                console.log('data storage process error:', error);
            })
        }))
    }

    stop(): void {
        try {
            this.dataStorageProcess?.kill();
        } catch (e) {
            console.log("[Flowser] failed to stop storage: ", e.message)
        }
    }

    async getStorageData(account: string): Promise<AccountsStorage> {
        account = account.indexOf('0x') === 0 ? account.substr(2) : account;
        // TODO: Resource url
        let response;
        try {
            // TODO: Improve once Data storage will be configurable
            console.log("fetching storage data for: ", account)
            response = await axios.get('http://backend:8888/storage')
            console.log("fetched storage data for: ", account)
        } catch (e) {
            // TODO: fix storage process not starting (fetch returns ECONNRESET)
            console.error('Error fetching storage:', e.message);
        }
        const storage = response?.data || {};
        return account in storage ? storage[account] : [];
    }
}
