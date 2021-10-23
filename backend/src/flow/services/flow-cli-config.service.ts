import { mkdir, readFile, stat, writeFile } from "fs/promises";
import { join } from "path";
import config from "../../config";
import { Injectable } from "@nestjs/common";

export type FlowCliConfig = {
    emulators: {
        default: {
            port: number;
            serviceAccount: string;
        }
    },
    contracts: Map<any, any>;
    networks: Map<string, string>;
    deployments: Map<any, any>
    accounts: Map<string, {
        address: string;
        key: string;
    }>;
}

@Injectable()
export class FlowCliConfigService {

    private projectId: string;
    public data: FlowCliConfig;

    configure (projectId: string) {
        this.projectId = projectId;
    }

    async init() {
        console.log(`[Flowser] initialising emulator for project: ${this.projectId}`)
        await FlowCliConfigService.mkdirIfEnoent(config.flowserRootDir);
        await FlowCliConfigService.mkdirIfEnoent(this.projectDirPath);
    }

    get projectDirPath () {
        return join(config.flowserRootDir, this.projectId);
    }

    get databaseDirPath () {
        return join(this.projectDirPath, "flowdb")
    }

    get flowConfigPath () {
        return join(this.projectDirPath, "flow.json");
    }

    get totalAccounts() {
        return Object.keys(this.data.accounts).length;
    }

    async load() {
        console.log(`[Flowser] loading flow cli configuration: ${this.flowConfigPath}`)
        const data = await readFile(this.flowConfigPath);
        this.data = JSON.parse(data.toString());
    }

    async save() {
        console.log(`[Flowser] storing flow cli configuration: ${this.flowConfigPath}`)
        await writeFile(this.flowConfigPath, JSON.stringify(this.data, null, 4))
    }

    // create directory if it does not already exist
    private static async mkdirIfEnoent(path: string) {
        try {
            await stat(path)
            console.debug(`[Flowser] directory "${path}", skipping creation.`)
        } catch (e) {
            if (e.code === "ENOENT") {
                console.debug(`[Flowser] directory "${path}" not found, creating...`)
                await mkdir(path)
            } else {
                throw e;
            }
        }
    }
}
