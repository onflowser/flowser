import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { writeFile } from "fs";
import { env } from "./config";
import { createApp } from "./index";
const packageJson = require("../package.json");

declare const module: any;

async function bootstrap() {
  const app = await createApp();

  setupOpenApiDocs(app);

  app.enableCors();
  await app.listen(env.HTTP_PORT);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

function setupOpenApiDocs(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle("Flowser")
    .setDescription("The Flowser API description")
    .setVersion(packageJson.version)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  if (env.GENERATE_API_DOCS_FILE) {
    writeFile("openapi.json", JSON.stringify(document, null, 4), () =>
      console.log("Generated openapi.json file in project root.")
    );
  }
  SwaggerModule.setup("api", app, document);
}

bootstrap();

process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
  // application specific logging, throwing an error, or other logic here
});
