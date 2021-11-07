import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { Injectable, Logger } from "@nestjs/common";
import { Project } from "../../projects/entities/project.entity";
import { EmulatorConfigurationEntity } from "../../projects/entities/emulator-configuration.entity";
import { EventEmitter } from "events";
import { FlowCliService } from "./flow-cli.service";
import { randomString } from "../../utils";

type StartCallback = (error: Error, data: string[]) => void;

export enum FlowEmulatorState {
    STOPPED = "stopped", // emulator is not running (exited or hasn't yet been started)
    STARTED = "started", // emulator has been started, but is not yet running (it may error out)
    RUNNING = "running", // emulator is safely running without initialisation errors
}

type FlowEmulatorLog = {
    level: 'debug' | 'info' | 'error';
    time: string;
    [key: string]: string;
}

@Injectable()
export class FlowEmulatorService {

    public events: EventEmitter = new EventEmitter();
    public state: FlowEmulatorState = FlowEmulatorState.STOPPED;
    private projectId: string;
    private configuration: EmulatorConfigurationEntity;
    private emulatorProcess: ChildProcessWithoutNullStreams;
    private logs: string[] = [];
    private readonly logger = new Logger(FlowEmulatorService.name);

    constructor (private flowCliService: FlowCliService) {
    }

    configureProjectContext (project: Project) {
        this.projectId = project?.id;
        this.configuration = project.emulator;
    }

    async init () {
        this.logger.debug(`initialising for project: ${this.projectId}`)
        await this.flowCliService.init();
    }

    async start (cb: StartCallback = () => null) {
        const flags = this.getFlags();
        this.logger.debug(`starting with (${flags.length}) flags: ${flags.join(" ")}`)

        return new Promise(((resolve, reject) => {
            try {
                this.emulatorProcess = spawn("flow", [
                    'emulator',
                    ...flags
                ], {
                    cwd: this.flowCliService.projectDirPath
                })
            } catch (e) {
                this.setState(FlowEmulatorState.STOPPED);
                cb(e, null)
                reject(e);
            }

            this.emulatorProcess.stdout.on("data", data => {
                const lines = data.toString().split("\n").filter(e => !!e)

                // temporarily store the logs in memory for possible examination
                this.logs.push(...lines);

                const lineMatch = (line, s) => line.toLowerCase().includes(s.toLowerCase());
                const linesMatch = s => Boolean(lines.find(line => lineMatch(line, s)));

                if (this.isState(FlowEmulatorState.STOPPED) && linesMatch("starting http server")) {
                    // emulator is starting (could still exit due to init error)
                    this.setState(FlowEmulatorState.STARTED)
                    // assume that if no error is thrown in 0.5s, the emulator is running
                    // this line is needed, because if verbose flag is not included
                    // emulator may not emit any more logs in the near future
                    // therefore we can't reliably tell if emulator started successfully
                    setTimeout(() => this.onServerRunning(), 1000)
                }
                    // next line after "🌱  Starting HTTP server ..." is either "❗  Server error...", some other line, or no line
                    // TODO: logic for determining if emulator started successfully should be improved
                // https://github.com/onflowser/flowser/issues/33
                else if (this.isState(FlowEmulatorState.STARTED) && !linesMatch("server error")) {
                    // emulator successfully started
                    this.onServerRunning();
                    resolve(true);
                }

                cb(null, FlowEmulatorService.formatLogLines(lines))
            })

            // No data is emitted to stderr for now
            // this.emulatorProcess.stderr.on("data", data => {})

            this.emulatorProcess.on("close", code => {
                const error = this.getError() || new Error(`Emulator exited with code ${code}`)
                this.setState(FlowEmulatorState.STOPPED);
                this.logger.debug(error.message)
                reject(error);
            })

            this.emulatorProcess.on("error", error => {
                cb(error, null)
                reject(error)
            })

            // given that no logs are emitted after "🌱  Starting HTTP server ..." line
            // assume that the server successfully started after 2s timeout
            setTimeout(resolve, 2000)
        }))
    }

    stop () {
        return new Promise(resolve => {
            this.logger.debug(
                this.isRunning()
                    ? `stopping pid: ${this.emulatorProcess.pid}`
                    : `already stopped, skipping`
            )
            if (this.isRunning()) {
                const isKilled = this.emulatorProcess.kill();
                // resolve only when the emulator process exits
                this.events.on(FlowEmulatorState.STOPPED, () => {
                    this.logger.debug(`Process ${this.emulatorProcess.pid} stopped`)
                    resolve(isKilled)
                })
            } else {
                resolve(true);
            }
        })
    }

    // called when emulator is up and running
    async onServerRunning () {
        // ensure correct state transition STARTED => RUNNING
        if (!this.isState(FlowEmulatorState.STARTED)) {
            return;
        }
        this.setState(FlowEmulatorState.RUNNING)
        if (this.configuration.numberOfInitialAccounts) {
            try {
                await this.initialiseAccounts(
                    parseInt(this.configuration.numberOfInitialAccounts as string)
                )
            } catch (e) {
                this.logger.error(`failed to initialise accounts: ${e.message}`, e.stack)
            }
        }
    }

    async initialiseAccounts (n: number) {
        await this.flowCliService.load();
        const diff = n - this.flowCliService.totalNonServiceAccounts;
        this.logger.debug(`generating ${diff} initial flow accounts`)
        for (let i = 0; i < diff; i++) {
            const { address, privateKey } = await this.createAccount();
            this.flowCliService.data.accounts[randomString()] = {
                key: privateKey,
                address,
            }
            this.logger.debug(`generated account: ${address}`)
        }
        await this.flowCliService.save();
    }

    async createAccount () {
        const keysOutput = await this.flowCliService.execute("flow", ["keys", "generate"])
        const privateKey = keysOutput[1][1];
        const publicKey = keysOutput[2][1];
        const accountOutput = await this.flowCliService.execute("flow", ["accounts", "create", "--key", publicKey]);
        const address = accountOutput[1][1];
        return { address, publicKey, privateKey }
    }

    isRunning () {
        return (
            !this.emulatorProcess?.killed &&
            [FlowEmulatorState.STARTED, FlowEmulatorState.RUNNING].includes(this.state)
        );
    }

    public getError () {
        for (let i = this.logs.length - 1; i > 0; i--) {
            if (this.logs[i].includes("level=error")) {
                const errorLine = FlowEmulatorService.parseLogLine(this.logs[i]);
                return errorLine.error ? new Error(errorLine.error) : null
            }
        }
        return null;
    }

    private setState (state: FlowEmulatorState) {
        this.logger.debug(`emulator state changed: ${state}`)
        this.events.emit(state);
        this.state = state;
    }

    private isState (state: FlowEmulatorState) {
        return this.state === state;
    }

    private getFlags () {
        const { flag } = FlowEmulatorService;

        // https://github.com/onflow/flow-emulator#configuration
        return [
            flag("port", this.configuration.rpcServerPort),
            flag("http-port", this.configuration.httpServerPort),
            flag("block-time", this.configuration.blockTime),
            flag("service-priv-key", this.configuration.servicePrivateKey),
            flag("service-pub-key", this.configuration.servicePublicKey),
            flag("dbpath", this.configuration.databasePath),
            flag("token-supply", this.configuration.tokenSupply),
            flag("transaction-expiry", this.configuration.transactionExpiry),
            flag("storage-per-flow", this.configuration.storagePerFlow),
            flag("min-account-balance", this.configuration.minAccountBalance),
            flag("transaction-max-gas-limit", this.configuration.transactionMaxGasLimit),
            flag("script-gas-limit", this.configuration.scriptGasLimit),
            flag("service-sig-algo", this.configuration.serviceSignatureAlgorithm),
            flag("service-hash-algo", this.configuration.serviceHashAlgorithm),
            flag("storage-limit", this.configuration.storageLimit),
            flag("transaction-fees", this.configuration.transactionFees),
            flag("dbpath", this.configuration.databasePath || this.flowCliService.databaseDirPath),
            // flow emulator is always started with persist flag
            // this is needed, so that storage script can index the db
            flag("persist", true),
            flag("verbose", this.configuration.verboseLogging),
            flag("init", true)
        ].filter(Boolean);
    }

    static formatLogLines (lines: string[]) {
        return lines.map(line => {
            const {
                level,
                time,
                msg,
                ...rest
            } = FlowEmulatorService.parseLogLine(line);
            // format example: Thu Oct 28 2021 21:20:51
            const formattedTime = new Date(time).toString().split(" ").slice(0, 5).join(" ")
            // appends the rest of the values in key="value" format
            return (
                level.toUpperCase().slice(0, 4) +
                `[${formattedTime}] ` +
                msg +
                Object
                    .keys(rest)
                    .map(key => `${key}="${rest[key]}"`)
                    .reduce((p, c) => `${p} ${c}`, '')
            )
        });
    }

    static parseLogLine (line: string): FlowEmulatorLog {
        const keyValuePairs = [];
        // https://regex101.com/r/gVlMZ0/1
        // tokenizes log lines into key=value pair array
        const matches = line.matchAll(/[a-z]+=("([^"]+"))|([^\s]+)/g);
        for (let [match] of matches) {
            // each match is of form key=value or key="foo bar"
            const [key, value] = match
                .toString()
                .replace(/"/g, "") // remove " chars if they exist
                // "\\x1b" or "\u001b" are ansi escape codes
                .replace(/(\u001b)|(\\x1b)\[[^m]*m/g, "") // remove ansi color escape codes (https://regex101.com/r/PoqKom/1)
                .split("="); // split into [key, value] pairs
            keyValuePairs.push({ [key]: value })
        }
        return keyValuePairs.reduce((p, c) => ({ ...p, ...c }), {})
    }

    private static flag (name: string, userValue: any, defaultValue?: any) {
        const value = userValue || defaultValue;
        return value ? `--${name}=${value}` : undefined;
    }

}
