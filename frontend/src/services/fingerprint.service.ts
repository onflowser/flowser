import FingerprintJS from "@fingerprintjs/fingerprintjs";

export class FingerprintService {
  async getUserFingerprintId(): Promise<string> {
    const fingerprint = await FingerprintJS.load();
    const { visitorId, confidence } = await fingerprint.get();
    console.log(
      `Identifying user ${visitorId} with confidence ${confidence.score}`
    );
    return visitorId;
  }
}
