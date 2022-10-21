import {
  INestApplication,
  NestApplicationOptions,
  ValidationPipe,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./core/filters/http-exception.filter";
import { Config, ConfigService } from "./core/services/config.service";

export { ProcessManagerService } from "./processes/process-manager.service";

export type CreateAppOptions = {
  config: Config;
  nest?: NestApplicationOptions;
};

export async function createApp(
  options: CreateAppOptions
): Promise<INestApplication> {
  ConfigService.setConfiguration(options.config);

  const app = await NestFactory.create(AppModule, options.nest);
  app.setGlobalPrefix("/api");
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors();
  await app.listen(options.config.common.httpServerPort);

  return app;
}
