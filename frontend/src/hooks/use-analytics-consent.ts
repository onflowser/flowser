import { LocalStorageState, useLocalStorage } from "./use-local-storage";
import { useEffect } from "react";
import { ServiceRegistry } from "../services/service-registry";

export function useAnalyticsConsent(): LocalStorageState<boolean> {
  const { analyticsService } = ServiceRegistry.getInstance();
  const storedSetting = useLocalStorage<boolean>({
    key: "consent-analytics",
  });

  const [consent] = storedSetting;

  useEffect(() => {
    if (consent) {
      analyticsService.enable();
    } else {
      analyticsService.disable();
    }
  }, [consent]);

  return storedSetting;
}
