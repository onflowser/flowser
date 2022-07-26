import { join } from "path";
import { cleanEnv, str, num } from "envalid";

const defaultServiceAccountPubKey =
  "5a6a7bdb81838e40fc615d4c0eed3d4caacfc7f47a89d319caa370aac6196113573738ba57e09ea5a27a192d48457ee5c0e32011bc10ef93383aabad24a9ce2a";
const defaultServiceAccountPrivKey =
  "680fa28962650ef346a7edf23d63967b0fcf44958488d0d48f8539ece6e92eba";

export const env = cleanEnv(process.env, {
  DATABASE_TYPE: str({
    default: "mysql",
    choices: ["mysql", "mariadb", "sqlite", "better-sqlite3"],
  }),
  DATABASE_NAME: str(),
  DATABASE_HOST: str({ default: "localhost" }),
  DATABASE_PORT: num({ default: 3306 }),
  DATABASE_USERNAME: str({ default: "" }),
  DATABASE_PASSWORD: str({ default: "" }),

  DATA_FETCH_INTERVAL: num({ default: 1000 }),
  USER_MANAGED_EMULATOR_PORT: num({ default: 8081 }),
  FLOW_STORAGE_SERVER_PORT: num({ default: 8889 }),

  HTTP_PORT: num({ default: 3001 }),

  FLOW_EMULATOR_HTTP_PORT: num({ default: 8080 }),
  FLOW_ACCOUNT_ADDRESS: str({ default: "f8d6e0586b0a20c7" }),
  FLOW_ACCOUNT_PRIVATE_KEY: str({
    default: defaultServiceAccountPrivKey,
  }),
  FLOW_ACCOUNT_PUBLIC_KEY: str({
    default: defaultServiceAccountPubKey,
  }),
});

export default {
  dataFetchInterval: env.DATA_FETCH_INTERVAL,
  // __dirname is <project-root>/dist folder
  flowserRootDir: join(__dirname, "..", ".flowser"),
  userManagedEmulatorPort: env.USER_MANAGED_EMULATOR_PORT,
  storageServerPort: env.FLOW_STORAGE_SERVER_PORT,
};
