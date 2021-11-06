import { mkdir, readFile, stat, writeFile, rm } from "fs/promises";
import { join } from "path";
import config from "../../config";
import { Injectable, Logger } from "@nestjs/common";
import { EmulatorConfigurationEntity } from "../../projects/entities/emulator-configuration.entity";
import { spawn } from "child_process";

export type FlowCliConfig = {
    emulators: {
        default: {
            port: number;
            serviceAccount: string;
        }
    },
    contracts: object;
    networks: object
    accounts: object;
    deployments: object;
}

@Injectable()
export class FlowCliService {

    private projectId: string;
    private emulatorConfig: EmulatorConfigurationEntity;
    public data: FlowCliConfig;
    private readonly logger = new Logger(FlowCliService.name);

    configure (projectId: string, emulatorConfiguration: EmulatorConfigurationEntity) {
        this.projectId = projectId;
        this.emulatorConfig = emulatorConfiguration;
    }

    async init () {
        this.logger.debug(`initialising flow-cli for project: ${this.projectId}`)
        await FlowCliService.mkdirIfEnoent(config.flowserRootDir);
        await FlowCliService.mkdirIfEnoent(this.projectDirPath);
        this.data = {
            "emulators": {
                "default": {
                    "port": parseInt(this.emulatorConfig.rpcServerPort as string),
                    "serviceAccount": "emulator-account"
                }
            },
            "contracts": {},
            "networks": {
                "emulator": `127.0.0.1:${this.emulatorConfig.rpcServerPort}`,
            },
            "accounts": {
                "emulator-account": {
                    "address": "f8d6e0586b0a20c7",
                    "key": this.emulatorConfig.servicePrivateKey
                }
            },
            "deployments": {}
        }
        await this.save();
    }

    async cleanup() {
        if (!this.emulatorConfig.persist) {
            // flow emulator is always started with persist flag
            // this is needed, so that storage script can index the db

            // if persist flag is not set in configuration
            // remove dir that contains persisted flow emulator data
            await FlowCliService.rmdir(this.databaseDirPath)
        }
    }

    async version() {
        const [versionLine, commitLine] = await this.execute("flow", ["version"])
        return {
            version: versionLine[1],
            commit: commitLine[1]
        }
    }

    get projectDirPath () {
        if (!this.projectId) {
            throw new Error("Can't retrieve project path: No project used")
        }
        return join(config.flowserRootDir, this.projectId);
    }

    get databaseDirPath () {
        return join(this.projectDirPath, "flowdb")
    }

    get flowConfigPath () {
        return join(this.projectDirPath, "flow.json");
    }

    get totalAccounts () {
        return Object.keys(this.data.accounts).length;
    }

    get totalNonServiceAccounts () {
        return this.totalAccounts - 1;
    }

    async load () {
        this.logger.debug(`loading flow-cli configuration: ${this.flowConfigPath}`)
        const data = await readFile(this.flowConfigPath);
        this.data = JSON.parse(data.toString());
    }

    async save () {
        this.logger.debug(`storing flow-cli configuration: ${this.flowConfigPath}`)
        await writeFile(this.flowConfigPath, JSON.stringify(this.data, null, 4))
    }

    async execute (bin = "", args, parsedOutput = true): Promise<string | string[][]> {
        if (!bin) {
            throw new Error("Provide a command");
        }
        this.logger.debug(`executing command: ${bin} ${args.join(" ")}`)
        return new Promise(((resolve, reject) => {
            let out = "";
            const process = spawn(bin, args, {
                cwd: this.projectId ? this.projectDirPath : undefined
            });

            process.stdout.on("data", data => {
                out += data.toString();
            })

            process.stderr.on("data", data => {
                out += data.toString();
            })

            process.on("exit", (code) => code === 0
                ? resolve(parsedOutput ? parseOutput(out) : out)
                : reject(out)
            );
        }))

        function parseOutput (out) {
            return out.split("\n").map(parseLine).filter(Boolean)
        }

        function parseLine (line) {
            const value = line.trim();
            // parse multiple possible key -> value mapping formats
            // "key: value" or "key value"
            if (/\t/.test(value)) {
                return value.split(/[ ]*\t[ ]*/);
            } if (/: /.test(value)) {
                return value.split(/: /);
            } else {
                return value;
            }
        }
    }

    // create directory if it does not already exist
    private static async mkdirIfEnoent (path: string) {
        try {
            await stat(path)
            console.debug(`directory "${path}" exists, skipping creation`)
        } catch (e) {
            if (e.code === "ENOENT") {
                console.debug(`directory "${path}" not found, creating`)
                await mkdir(path)
            } else {
                throw e;
            }
        }
    }

    private static async rmdir (path: string) {
        return rm(path, { force: true, recursive: true })
    }
}
