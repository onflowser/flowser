import { cleanEnv, str, num, bool } from "envalid";

export const env = cleanEnv(process.env, {
  GENERATE_API_DOCS_FILE: bool({ default: false }),
  DATABASE_TYPE: str({
    default: "sqlite",
    choices: ["mysql", "mariadb", "sqlite"],
  }),
  DATABASE_NAME: str({ default: ":memory:" }),
  DATABASE_HOST: str({ default: "localhost" }),
  DATABASE_PORT: num({ default: 3306 }),
  DATABASE_USERNAME: str({ default: "" }),
  DATABASE_PASSWORD: str({ default: "" }),

  DATA_FETCH_INTERVAL: num({ default: 1000 }),
  FLOW_STORAGE_SERVER_PORT: num({ default: 8889 }),

  HTTP_PORT: num({ default: 6061 }),
});
