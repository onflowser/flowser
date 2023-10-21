import FingerprintJS from '@fingerprintjs/fingerprintjs';

export class FingerprintService {
  //  Alternative fingerprinting idea:
  //  At the very beginning generate an uuid and store it permanently.
  //  Every subsequent time the app is opened, reuse the persisted uuid.
  async getUserFingerprintId(): Promise<string> {
    const fingerprint = await FingerprintJS.load();
    const { visitorId, confidence } = await fingerprint.get({ debug: false });
    console.log(
      `Identifying user ${visitorId} with confidence ${confidence.score}`
    );
    return visitorId;
  }
}
