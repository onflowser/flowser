import { useEffect } from "react";
import { ServiceRegistry } from "../services/service-registry";
import { useLocalStorage } from "usehooks-ts";

type AnalyticsConsent = {
  setIsConsented: (isConsented: boolean) => void;
  isConsented: boolean;
};

export function useAnalyticsConsent(): AnalyticsConsent {
  const { analyticsService } = ServiceRegistry.getInstance();
  const [isConsented, setIsConsented] = useLocalStorage<boolean>(
    "consent-analytics",
    false
  );

  useEffect(() => {
    if (isConsented) {
      analyticsService.enable();
    } else {
      analyticsService.disable();
    }
  }, [isConsented]);

  return {
    isConsented,
    setIsConsented,
  };
}
