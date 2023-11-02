import mixpanel, { Dict } from 'mixpanel-browser';
import { FingerprintService } from './fingerprint.service';

const enableAnalytics = process.env.NODE_ENV === 'production';

export class AnalyticsService {
  private fingerprintService: FingerprintService;

  constructor() {
    this.fingerprintService = new FingerprintService();
    this.init();
  }
  async init(): Promise<void> {
    mixpanel.init('1b358339dc3d7476217983016b83fcab', {
      debug: !enableAnalytics,
    });

    try {
      mixpanel.identify(await this.fingerprintService.getUserFingerprintId());
    } catch (e) {
      console.error('Failed to identify user', e);
    }
  }

  disable(): void {
    mixpanel.opt_out_tracking();
  }

  enable(): void {
    mixpanel.opt_in_tracking();
  }

  track(event: string, properties: Dict = {}): void {
    if (!enableAnalytics) {
      console.log('Analytics disabled. Skipping event ', event);
      return;
    }

    try {
      mixpanel.track(event, properties);
    } catch (e) {
      console.error('Mixpanel error:', e);
    }
  }
}
