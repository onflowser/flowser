import { ChildProcessWithoutNullStreams, exec } from "child_process";
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
                // TODO: debug weird problem when (error, stdout) callback is not called on Darwin
                // seems like stdout stream is ignored,
                // initially I thought that the issue lies in the fact that spawn doesn't buffer stdout output,
                // so I refactored to exec call, but that doesn't fix the issue either
                // for now just assume that server started after 2s ?
                this.dataStorageProcess = exec("main_linux_x86_64", {
                    cwd: this.flowCliConfig.projectDirPath,
                }, (stderr, stdout) => {
                    const findLine = (pattern, std) => std
                        .toString()
                        .split("\n")
                        .filter(l => l.includes(pattern))
                    const error = findLine("Storage server error", stderr)
                    if (error) {
                        return reject(error)
                    }
                    // process will emit "Storage server started" when server starts successfully
                    if (findLine("Storage server started", stdout)) {
                        resolve(true);
                    }
                });
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
            this.dataStorageProcess.kill();
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
