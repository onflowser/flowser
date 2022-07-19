import { join } from "path";
import { cleanEnv, str, num } from "envalid";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const env = cleanEnv(process.env, {
  DATABASE_TYPE: str({
    default: "mysql",
    choices: ["mysql", "mariadb", "postgres", "sqlite"],
  }),
  DATABASE_HOST: str({ default: "localhost" }),
  DATABASE_PORT: num({ default: 3306 }),
  DATABASE_USERNAME: str(),
  DATABASE_PASSWORD: str(),
  DATABASE_NAME: str(),

  DATA_FETCH_INTERVAL: num({ default: 3000 }),
  USER_MANAGED_EMULATOR_PORT: num({ default: 8081 }),
  FLOW_STORAGE_SERVER_PORT: num({ default: 8889 }),

  HTTP_PORT: num({ default: 3001 }),
});

export const databaseConfig: TypeOrmModuleOptions = {
  type: env.DATABASE_TYPE,
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  username: env.DATABASE_USERNAME,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
};

export default {
  dataFetchInterval: env.DATA_FETCH_INTERVAL,
  // __dirname is <project-root>/dist folder
  flowserRootDir: join(__dirname, "..", ".flowser"),
  userManagedEmulatorPort: env.USER_MANAGED_EMULATOR_PORT,
  storageServerPort: env.FLOW_STORAGE_SERVER_PORT,
};
