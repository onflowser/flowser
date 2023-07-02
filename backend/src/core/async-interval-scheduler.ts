import { Logger } from "@nestjs/common";

const logger = new Logger("Utils");

export type ExecutableCallback = () => Promise<void>;

export type AsyncIntervalOptions = {
  functionToExecute: ExecutableCallback;
  name: string;
  pollingIntervalInMs: number;
};

/**
 * Runs the provided function in interval.
 * Waits for promise completion until rerunning interval.
 */
export class AsyncIntervalScheduler {
  private isRunning: boolean;
  private runningTimeoutId: NodeJS.Timeout | undefined;
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
    const { functionToExecute, name, pollingIntervalInMs } = this.options;
    while (this.isRunning) {
      const startTime = new Date();
      try {
        await functionToExecute();
      } catch (e) {
        logger.error(`${name} failed`, e);
      }
      const endTime = new Date();
      const runTimeInMs = endTime.getTime() - startTime.getTime();
      const remainingTimeInMs = pollingIntervalInMs - runTimeInMs;

      if (remainingTimeInMs > 0) {
        await new Promise((resolve) => {
          this.runningTimeoutId = setTimeout(
            resolve,
            pollingIntervalInMs - runTimeInMs
          );
        });
      } else {
        // Runtime exceeded polling time.
        // Processing could be taking longer than expected.
        logger.debug(`${name} took ${runTimeInMs}ms`);
      }
    }
  }
}
