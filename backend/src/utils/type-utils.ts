import { PollingEntity } from "../core/entities/polling.entity";
import { TransactionEntity } from "../transactions/transaction.entity";

// https://stackoverflow.com/questions/58210331/exclude-function-types-from-an-object-type
type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

export type PollingEntityInitArguments<Entity extends PollingEntity> = Omit<
  NonFunctionProperties<TransactionEntity>,
  "createdAt" | "updatedAt"
>;
