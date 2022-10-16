import mixpanel, { Dict } from "mixpanel-browser";
import { queryClient } from "../config/react-query";
import { getCurrentProjectKey } from "../hooks/use-api";
import { GetSingleProjectResponse } from "@flowser/shared";

export enum AnalyticEvent {
  PROJECT_REMOVED = "project_removed",
  PROJECT_CREATED = "project_created",
  PROJECT_STARTED = "project_started",

  CLICK_PROJECT_SETTINGS = "click_project_settings",
  CLICK_CREATE_SNAPSHOT = "click_create_snapshot",
  CLICK_SEND_TRANSACTION = "click_send_transaction",
  CLICK_CHECKOUT_SNAPSHOT = "click_checkout_snapshot",

  CREATE_SNAPSHOT = "create_snapshot",
  CHECKOUT_SNAPSHOT = "checkout_snapshot",
  SEND_TRANSACTION = "send_transaction",

  DISCONNECT_WALLET = "disconnect_wallet",
  CONNECT_WALLET = "connect_wallet",
  RESTART_PROCESS = "restart_process",
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

  track(event: AnalyticEvent, properties: Dict = {}): void {
    if (!enableAnalytics) {
      console.log("Analytics disabled. Skipping event ", event);
      return;
    }

    const { project } =
      queryClient.getQueryData<GetSingleProjectResponse>(
        getCurrentProjectKey
      ) ?? {};

    const staticProperties = {
      currentUrl: window.location.href,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      browser: navigator.userAgent,
      browserVersion: navigator.appVersion,
      os: navigator.platform,
      projectName: project?.name,
    };
    try {
      mixpanel.track(event, {
        ...staticProperties,
        ...properties,
      });
    } catch (e) {
      console.error("Mixpanel error:", e);
    }
  }
}
