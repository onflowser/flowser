import { useEffect } from "react";
import { ServiceRegistry } from "../services/service-registry";
import { useLocalStorage } from "usehooks-ts";
import { AnalyticEvent } from "../services/analytics.service";
import { Dict } from "mixpanel-browser";

type Analytics = {
  setIsConsented: (isConsented: boolean) => void;
  isConsented: boolean | undefined;
  track: (event: AnalyticEvent, properties?: Dict) => void;
};

export function useAnalytics(): Analytics {
  const { analyticsService } = ServiceRegistry.getInstance();
  const [isConsented, setIsConsented] = useLocalStorage<boolean | undefined>(
    "consent-analytics",
    undefined
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
    track: analyticsService.track,
  };
}
