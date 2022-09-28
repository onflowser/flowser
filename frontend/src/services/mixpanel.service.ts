import mixpanel, { Dict } from "mixpanel-browser";

export enum AnalyticEvent {
  PROJECT_STARTED = "project_started",
}

export class MixpanelService {
  constructor() {
    this.init();
  }
  init(): void {
    const debug = process.env.NODE_ENV === "development";
    mixpanel.init("1b358339dc3d7476217983016b83fcab", { debug });
  }

  track(event: AnalyticEvent, properties?: Dict): void {
    try {
      mixpanel.track(event, properties);
    } catch (e) {
      console.error("Mixpanel error:", e);
    }
  }
}
