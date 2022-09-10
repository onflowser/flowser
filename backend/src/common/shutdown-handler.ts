export type ShutdownSignal = "SIGINT" | "SIGTERM";

export abstract class ShutdownHandler {
  protected constructor() {
    process.once("SIGINT", () => {
      this.onShutdown("SIGTERM");
    });
    process.once("SIGTERM", () => {
      this.onShutdown("SIGTERM");
    });
  }

  public abstract onShutdown(signal: ShutdownSignal);
}
