import { ServiceRegistry } from "../services/service-registry";

export function useAnalytics() {
  const { mixpanelService } = ServiceRegistry.getInstance();

  return {
    track: mixpanelService.track,
  };
}
