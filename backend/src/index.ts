import { INestApplication, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./core/filters/http-exception.filter";
import { Config, ConfigService } from "./core/services/config.service";

export { ProcessManagerService } from "./processes/process-manager.service";

export async function createApp(config: Config): Promise<INestApplication> {
  ConfigService.setConfiguration(config);

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("/api");
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors();
  await app.listen(config.common.httpServerPort);

  return app;
}
