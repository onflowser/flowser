import { useEffect } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";
import { AnalyticEvent } from "../contexts/analytics.service";
import { Dict } from "mixpanel-browser";
import { useFlowserHooksApi } from "../contexts/flowser-api.context";
import { useCurrentProjectId } from "./use-current-project-id";
import { useServiceRegistry } from "../contexts/service-registry.context";

type Analytics = {
  setIsConsented: (isConsented: boolean) => void;
  isConsented: boolean | undefined;
  track: (event: AnalyticEvent, properties?: Dict) => void;
};

export function useAnalytics(): Analytics {
  const { analyticsService } = useServiceRegistry();
  const [isConsented, setIsConsented] = useLocalStorage<boolean | undefined>(
    "consent-analytics",
    undefined
  );
  const api = useFlowserHooksApi();
  const currentProjectId = useCurrentProjectId();
  const { data: currentProject } = api.useGetFlowserProject(currentProjectId);

  useEffect(() => {
    if (isConsented) {
      analyticsService.enable();
    } else {
      analyticsService.disable();
    }
  }, [isConsented]);

  function track(event: AnalyticEvent, properties?: Dict) {
    return analyticsService.track(event, {
      ...properties,
      projectName: currentProject?.name,
    });
  }

  return {
    isConsented,
    setIsConsented,
    track,
  };
}
