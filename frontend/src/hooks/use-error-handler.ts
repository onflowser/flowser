import { CommonUtils } from "../utils/common-utils";
import toast from "react-hot-toast";

export type ErrorHandlerState = {
  handleError: (error: unknown) => void;
};

export function useErrorHandler(componentName: string): ErrorHandlerState {
  function handleError(error: unknown) {
    if (CommonUtils.isStandardApiError(error)) {
      toast.error(error.message);
    } else {
      toast.error("Unknown error");
    }
    console.error(`[${componentName}] handling error:`, error);
  }

  return { handleError };
}
