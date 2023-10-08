import { CommonUtils } from "../utils/common-utils";
import toast from "react-hot-toast";
import { usePlatformAdapter } from "../contexts/platform-adapter.context";

export type ErrorHandlerState = {
  handleError: (error: unknown) => void;
};

export function useErrorHandler(componentName: string): ErrorHandlerState {
  const { monitoringService } = usePlatformAdapter();

  function handleError(error: unknown) {
    console.error(`[${componentName}] handling error:`, error);
    if (CommonUtils.isStandardError(error)) {
      toast.error(error.message);
    } else {
      toast.error("Unknown error");
    }

    if (monitoringService) {
      monitoringService.captureError(error, {
        extra: {
          componentName,
        },
      });
    }
  }

  return { handleError };
}
