import { createApp } from "./index";
import { ConfigService } from "./core/services/config.service";
import { SwaggerModule } from "@nestjs/swagger";
import { getOpenApiDocument } from "./docs";

declare const module: any;

async function bootstrap() {
  ConfigService.setConfiguration(ConfigService.readFromEnv());

  const app = await createApp(ConfigService.readFromEnv());

  SwaggerModule.setup("api", app, getOpenApiDocument(app));

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();

process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
  // TODO(milestone-5): better handle errors
});
