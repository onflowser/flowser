import { LoggerService } from "@nestjs/common";
import logger from "electron-log";

// Log file location:
// - Linux: ~/.config/{app name}/logs/{process type}.log
// - macOS: ~/Library/Logs/{app name}/{process type}.log
// - Windows: %USERPROFILE%\AppData\Roaming\{app name}\logs\{process type}.log

// See https://github.com/megahertz/electron-log

export class Logger implements LoggerService {
  log(message: unknown, ...optionalParams: unknown[]): void {
    logger.log(message, ...optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    logger.error(message, ...optionalParams);
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    logger.warn(message, ...optionalParams);
  }

  debug?(message: unknown, ...optionalParams: unknown[]): void {
    logger.debug(message, ...optionalParams);
  }

  verbose?(message: unknown, ...optionalParams: unknown[]): void {
    logger.verbose(message, ...optionalParams);
  }
}
