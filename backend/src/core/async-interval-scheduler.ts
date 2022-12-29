import { Logger } from "@nestjs/common";

const logger = new Logger("Utils");

export type ExecutableCallback = () => Promise<void>;

export type AsyncIntervalOptions = {
  functionToExecute: ExecutableCallback;
  name: string;
  intervalInMs: number;
};

/**
 * Runs the provided function in interval.
 * Waits for promise completion until rerunning interval.
 */
export class AsyncIntervalScheduler {
  private isRunning: boolean;
  private runningTimeoutId: NodeJS.Timeout;
  private readonly options: AsyncIntervalOptions;

  constructor(options: AsyncIntervalOptions) {
    this.options = options;
    this.isRunning = false;
  }

  async start(): Promise<void> {
    this.isRunning = true;
    await this.handler();
  }

  stop(): void {
    this.isRunning = false;
  }

  private async handler() {
    const { functionToExecute, name, intervalInMs } = this.options;
    if (!this.isRunning) {
      return;
    }
    try {
      const startTime = new Date();
      await functionToExecute();
      const endTime = new Date();
      const runTimeInMs = endTime.getTime() - startTime.getTime();
      if (runTimeInMs > intervalInMs) {
        logger.debug(`${name} took ${runTimeInMs}ms`);
      }
    } catch (e) {
      logger.error(`${name} failed`, e);
    }
    this.runningTimeoutId = setTimeout(this.handler.bind(this), intervalInMs);
  }
}
