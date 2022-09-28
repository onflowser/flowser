import mixpanel, { Dict } from "mixpanel-browser";

export enum AnalyticEvent {
  PROJECT_STARTED = "project_started",
}

// TODO(milestone-6): Enable before release
const enableAnalytics = false;

export class MixpanelService {
  constructor() {
    this.init();
  }
  init(): void {
    const debug = process.env.NODE_ENV === "development";
    mixpanel.init("1b358339dc3d7476217983016b83fcab", { debug });
  }

  track(event: AnalyticEvent, properties?: Dict): void {
    if (!enableAnalytics) {
      console.log("Analytics disabled. Skipping event ", event);
      return;
    }
    try {
      mixpanel.track(event, properties);
    } catch (e) {
      console.error("Mixpanel error:", e);
    }
  }
}
