import { useEffect } from 'react';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useFlowserHooksApi } from '../contexts/flowser-api.context';
import { useCurrentProjectId } from './use-current-project-id';
import { useServiceRegistry } from '../contexts/service-registry.context';

export enum AnalyticEvent {
  PAGE_VIEW = 'page_view',

  PROJECT_REMOVED = 'project_removed',
  PROJECT_CREATED = 'project_created',
  PROJECT_STARTED = 'project_started',

  CLICK_MINIMIZE_STORAGE_CARD = 'click_minimize_storage_card',
  CLICK_EXPAND_STORAGE_CARD = 'click_expand_storage_card',
  CLICK_PROJECT_SETTINGS = 'click_project_settings',
  CLICK_CREATE_SNAPSHOT = 'click_create_snapshot',
  CLICK_CHECKOUT_SNAPSHOT = 'click_checkout_snapshot',

  CREATE_SNAPSHOT = 'create_snapshot',
  CHECKOUT_SNAPSHOT = 'checkout_snapshot',

  RESTART_PROCESS = 'restart_process',
}

type Analytics = {
  setIsConsented: (isConsented: boolean) => void;
  isConsented: boolean | undefined;
  track: (event: AnalyticEvent, properties?: Record<string, unknown>) => void;
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

  function track(event: AnalyticEvent, properties?: Record<string, unknown>) {
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
