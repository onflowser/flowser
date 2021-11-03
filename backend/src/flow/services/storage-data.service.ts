import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { Injectable } from "@nestjs/common";
import { FlowCliConfigService } from "./flow-cli-config.service";
import { AccountsStorage } from '../../accounts/entities/storage.entity';
import axios from 'axios';

type StartCallback = (error: Error, data: string[]) => void;

@Injectable()
export class StorageDataService {

    private dataStorageProcess: ChildProcessWithoutNullStreams;
    constructor (private flowCliConfig: FlowCliConfigService) {
    }

    async start (cb: StartCallback = () => null) {
        const flowDbPath: string = this.flowCliConfig.databaseDirPath;
        console.log(`[Flowser] starting data storage process`);
        console.log(`[Flowser] expecting flow database to be inside ${flowDbPath} directory`)

        return new Promise(((resolve, reject) => {
            try {
                this.dataStorageProcess = spawn("main_linux_x86_64", {
                    cwd: this.flowCliConfig.projectDirPath,
                });
                this.dataStorageProcess.on("spawn", () => resolve(true));
                this.dataStorageProcess.on("exit", (code) => reject(`Storage process exited with code: ${code}`));
                resolve(true);
            } catch (e) {
                const message = `Storage data error: ${e.message}`;
                reject(message);
            }

            this.dataStorageProcess.stdout.on("data", data => {
                console.log('data', data);
            })

            this.dataStorageProcess.on("close", code => {
                console.log('data storage process exit code:', code);

            })

            this.dataStorageProcess.on("error", error => {
                console.log('data storage process error:', error);
            })
        }))
    }

    stop(): void {
        this.dataStorageProcess.kill();
    }

    async getStorageData(account: string): Promise<AccountsStorage> {
        account = account.indexOf('0x') === 0 ? account.substr(2) : account;
        // TODO: Resource url
        let response;
        try {
            // TODO: Improve once Data storage will be configurable
            response = await axios.get('http://backend:8888/storage')
        } catch (e) {
            console.error('Error fetching storage:', e.message);
        }
        const storage = response?.data || {};
        return account in storage ? storage[account] : [];
    }
}
