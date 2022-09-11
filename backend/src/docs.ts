import { writeFile } from "fs";
import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { createApp } from "./index";
import { ConfigService } from "./common/config.service";
const packageJson = require("../package.json");

export function getOpenApiDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle("Flowser")
    .setDescription("The Flowser API description")
    .setVersion(packageJson.version)
    .build();
  return SwaggerModule.createDocument(app, config);
}

async function generateDocs() {
  const app = await createApp(ConfigService.readFromEnv());

  const document = getOpenApiDocument(app);
  writeFile("openapi.json", JSON.stringify(document, null, 4), () =>
    console.log("Generated openapi.json file in project root.")
  );
}
