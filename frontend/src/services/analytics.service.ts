import mixpanel, { Dict } from "mixpanel-browser";
import { queryClient } from "../config/react-query";
import { getCurrentProjectKey } from "../hooks/use-api";
import { GetSingleProjectResponse } from "@flowser/shared";
import { FingerprintService } from "./fingerprint.service";

export enum AnalyticEvent {
  PAGE_VIEW = "page_view",

  PROJECT_REMOVED = "project_removed",
  PROJECT_CREATED = "project_created",
  PROJECT_STARTED = "project_started",

  CLICK_MINIMIZE_STORAGE_CARD = "click_minimize_storage_card",
  CLICK_EXPAND_STORAGE_CARD = "click_expand_storage_card",
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

const enableAnalytics = process.env.NODE_ENV === "production";

export class AnalyticsService {
  private fingerprintService: FingerprintService;

  constructor() {
    this.fingerprintService = new FingerprintService();
    this.init();
  }
  async init(): Promise<void> {
    mixpanel.init("1b358339dc3d7476217983016b83fcab", {
      debug: !enableAnalytics,
    });

    try {
      mixpanel.identify(await this.fingerprintService.getUserFingerprintId());
    } catch (e) {
      console.error("Failed to identify user", e);
    }
  }

  disable(): void {
    mixpanel.opt_out_tracking();
  }

  enable(): void {
    mixpanel.opt_in_tracking();
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
