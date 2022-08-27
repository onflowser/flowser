import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

export async function createApp() {
  return await NestFactory.create(AppModule);
}
