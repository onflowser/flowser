import { FlowserError, ManagedProcess } from "@flowser/shared";
import { DecoratedPollingEntity } from "contexts/timeout-polling.context";

export class CommonUtils {
  static shorten(text: string, maxLength: number): string {
    if (maxLength >= text.length) {
      return text;
    }
    const delimiter = "...";
    const charsToTake = maxLength / 2;
    return `${text.slice(0, charsToTake)}${delimiter}${text.slice(
      text.length - charsToTake,
      text.length
    )}`;
  }

  static isEmulatorProcess(process: ManagedProcess): boolean {
    return process.id === "emulator";
  }

  static isDevWalletProcess(process: ManagedProcess): boolean {
    return process.id === "dev-wallet";
  }

  static isDecoratedPollingEntity<Entity>(
    entity: Entity
  ): entity is DecoratedPollingEntity<Entity> {
    return "isNew" in entity && "isUpdated" in entity;
  }

  static isFlowserError(error: unknown): error is FlowserError {
    return (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      "message" in error &&
      "description" in error
    );
  }

  static isStandardError(error: unknown): error is Error {
    return typeof error === "object" && error !== null && "message" in error;
  }

  static isNotEmpty<Value>(value: Value | null | undefined): value is Value {
    return value !== null && value !== undefined;
  }

  static getNestedValue(object: unknown, path: string): unknown {
    const keys = path.split(".");
    let result: unknown = object;
    for (const key of keys) {
      if (!this.isRecord(result)) {
        return undefined;
      }
      result = result[key];
    }
    return result;
  }

  static isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  static isDefined<Value>(value: Value | null | undefined): value is Value {
    return value !== null && value !== undefined;
  }
}
