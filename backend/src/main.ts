import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { writeFile } from "fs";
import { env } from "./config";
import { createApp } from "./index";
const packageJson = require("../package.json");

declare const module: any;

async function bootstrap() {
  const app = await createApp();

  const config = new DocumentBuilder()
    .setTitle("Flowser")
    .setDescription("The Flowser API description")
    .setVersion(packageJson.version)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  writeFile("openapi.json", JSON.stringify(document, null, 4), () =>
    console.log("OpenAPI spec file updated!")
  );
  SwaggerModule.setup("api", app, document);

  app.enableCors();
  await app.listen(env.HTTP_PORT);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
