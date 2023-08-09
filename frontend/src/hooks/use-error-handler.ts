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
    if (!CommonUtils.isFlowserError(error)) {
      toast.error("Unknown error");
      return;
    }
    if (error.description !== "") {
      toast.error(`${error.message}: ${error.description}`);
    } else {
      toast.error(error.message);
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
