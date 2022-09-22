import { BetterSqlite3ConnectionOptions } from "typeorm/driver/better-sqlite3/BetterSqlite3ConnectionOptions";
import { DataSource, DataSourceOptions } from "typeorm";
import { ConfigService } from "./core/services/config.service";

export function getDatabaseOptions(): DataSourceOptions {
  const { database } = ConfigService.getConfig();
  const commonOptions = {
    autoLoadEntities: true,
    synchronize: true,
  };
  switch (database.type) {
    case "sqlite":
      return {
        type: "better-sqlite3",
        database: database.name,
        ...commonOptions,
      } as BetterSqlite3ConnectionOptions;
    case "mysql":
      return {
        type: database.type,
        host: database.host,
        port: database.port,
        username: database.username,
        password: database.password,
        database: database.name,
        timezone: "Z",
        ...commonOptions,
      };
    default:
      throw new Error(`Database type ${database.type} not supported`);
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
