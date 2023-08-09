import React, { ReactElement } from "react";
import { JsonView } from "../json-view/JsonView";
import { FlowUtils } from "../../utils/flow-utils";

export type FlowApiErrorMessageProps = {
  errorMessage: string;
};

export function FlowApiErrorMessage({
  errorMessage,
}: FlowApiErrorMessageProps): ReactElement {
  const parsedMessage = FlowUtils.rawApiErrorToObject(errorMessage);
  return <JsonView name="error" data={parsedMessage} />;
}
