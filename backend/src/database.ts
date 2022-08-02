import { env } from "./config";
import { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions";
import { DataSource, DataSourceOptions } from "typeorm";

export function getDatabaseOptions(): DataSourceOptions {
  const commonOptions = {
    autoLoadEntities: true,
    synchronize: true,
  };
  switch (env.DATABASE_TYPE) {
    case "sqlite":
      return {
        type: "sqlite",
        database: env.DATABASE_NAME,
        ...commonOptions,
      } as SqliteConnectionOptions;
    case "mysql":
      return {
        type: env.DATABASE_TYPE,
        host: env.DATABASE_HOST,
        port: env.DATABASE_PORT,
        username: env.DATABASE_USERNAME,
        password: env.DATABASE_PASSWORD,
        database: env.DATABASE_NAME,
        timezone: "Z",
        ...commonOptions,
      };
    default:
      throw new Error(`Database type ${env.DATABASE_TYPE} not supported`);
  }
}

// TODO: reuse the existing instance created by @nestjs/typeorm
let dataSourceInstance: DataSource;
export async function getDataSourceInstance() {
  if (!dataSourceInstance) {
    dataSourceInstance = new DataSource(getDatabaseOptions());
  }
  if (!dataSourceInstance.isInitialized) {
    await dataSourceInstance.initialize();
  }
  return dataSourceInstance;
}
