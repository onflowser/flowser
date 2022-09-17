import { cleanEnv, str, num } from "envalid";
import { InternalServerErrorException } from "@nestjs/common";

export type DatabaseConfig = {
  type: "mysql" | "mariadb" | "sqlite";
  name: string;
  // Below options are required if using mysql or mariadb database
  port?: number;
  host?: string;
  username?: string;
  password?: string;
};

export type CommonConfig = {
  httpServerPort: number;
};

export type Config = {
  common: CommonConfig;
  database: DatabaseConfig;
};

export class ConfigService {
  private static config: Config;

  public static getConfig(): Config {
    if (!this.config) {
      throw new InternalServerErrorException("Config service not initialised");
    }
    return this.config;
  }

  public static setConfiguration(config: Config) {
    this.config = config;
  }

  public static readFromEnv(): Config {
    const env = cleanEnv(process.env, {
      DATABASE_TYPE: str({
        default: "sqlite",
        choices: ["mysql", "mariadb", "sqlite"],
      }),
      DATABASE_NAME: str({ default: "database.sqlite:" }),
      DATABASE_HOST: str({ default: "localhost" }),
      DATABASE_PORT: num({ default: 3306 }),
      DATABASE_USERNAME: str({ default: "" }),
      DATABASE_PASSWORD: str({ default: "" }),

      HTTP_PORT: num({ default: 6061 }),
    });
    return {
      database: {
        type: env.DATABASE_TYPE,
        name: env.DATABASE_NAME,
        host: env.DATABASE_NAME,
        port: env.DATABASE_PORT,
        username: env.DATABASE_USERNAME,
        password: env.DATABASE_PASSWORD,
      },
      common: {
        httpServerPort: env.HTTP_PORT,
      },
    };
  }
}
