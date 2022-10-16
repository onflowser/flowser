import * as Sentry from "@sentry/electron/renderer";

export class SentryRendererService {
  init(): void {
    Sentry.init({
      dsn: "https://38a653b591734e0bbe2695a321f554d9@o1430444.ingest.sentry.io/6781494",
    });
  }
}