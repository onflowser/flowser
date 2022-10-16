import { ServiceRegistry } from "../services/service-registry";

export function useAnalytics() {
  const { analyticsService } = ServiceRegistry.getInstance();

  return {
    track: analyticsService.track,
  };
}
