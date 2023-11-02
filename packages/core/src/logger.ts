export interface IFlowserLogger {
  error(message: any, error?: unknown): void;
  log(message: any): void;
  warn(message: any): void;
  debug(message: any): void;
  verbose(message: any): void;
}
