import * as Sentry from "@sentry/electron/renderer";
import { FingerprintService } from "../../../services/fingerprint.service";
import {
  CaptureErrorOptions,
  MonitoringServiceInt,
} from "../../../services/monitoring.service";

const enableAnalytics = process.env.NODE_ENV === "production";

export class SentryRendererService implements MonitoringServiceInt {
  private fingerprintService: FingerprintService;
  constructor() {
    this.fingerprintService = new FingerprintService();
  }
  async init(): Promise<void> {
    if (!enableAnalytics) {
      return;
    }
    Sentry.init({
      dsn: "https://38a653b591734e0bbe2695a321f554d9@o1430444.ingest.sentry.io/6781494",
    });
    try {
      Sentry.setUser({
        id: await this.fingerprintService.getUserFingerprintId(),
      });
    } catch (e) {
      console.log("Failed to identify user:", e);
    }
  }

  captureError(error: unknown, options?: CaptureErrorOptions): void {
    Sentry.captureException(error, options);
  }
}
