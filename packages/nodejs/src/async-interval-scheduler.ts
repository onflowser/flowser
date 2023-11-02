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

  start(): void {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    // We don't want to await the end of processing.
    this.pollExecutionIfRunning();
  }

  stop(): void {
    clearTimeout(this.runningTimeoutId);
    this.isRunning = false;
  }

  private async pollExecutionIfRunning() {
    const { functionToExecute, name, pollingIntervalInMs } = this.options;
    while (this.isRunning) {
      const startTime = new Date();
      try {
        await functionToExecute();
      } catch (e) {
        console.error(`${name} failed`, e);
      }
      const endTime = new Date();
      const runTimeInMs = endTime.getTime() - startTime.getTime();
      const remainingTimeInMs = pollingIntervalInMs - runTimeInMs;

      if (remainingTimeInMs > 0) {
        await new Promise((resolve) => {
          this.runningTimeoutId = setTimeout(
            resolve,
            pollingIntervalInMs - runTimeInMs,
          );
        });
      } else {
        // Runtime exceeded polling time.
        // Processing could be taking longer than expected.
        console.debug(`${name} took ${runTimeInMs}ms`);
      }
    }
  }
}
