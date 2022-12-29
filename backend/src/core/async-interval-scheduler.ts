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
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    await this.pollIfRunning();
  }

  stop(): void {
    clearTimeout(this.runningTimeoutId);
    this.isRunning = false;
  }

  private async pollIfRunning() {
    const { intervalInMs } = this.options;
    while (this.isRunning) {
      await this.executeCallback();
      await new Promise((resolve) => {
        this.runningTimeoutId = setTimeout(resolve, intervalInMs);
      });
    }
  }

  private async executeCallback() {
    const { functionToExecute, name, intervalInMs } = this.options;
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
  }
}
