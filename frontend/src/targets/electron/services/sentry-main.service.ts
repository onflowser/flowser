import * as Sentry from "@sentry/electron";
import { FingerprintService } from "../../../services/fingerprint.service";

export class SentryMainService {
  private fingerprintService: FingerprintService;
  constructor() {
    this.fingerprintService = new FingerprintService();
  }
  async init(): Promise<void> {
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
}
