import React, { FunctionComponent } from "react";
import { FlowserError } from "@flowser/shared";
import { CommonUtils } from "../../utils/common-utils";
import { Message } from "./Message";

export type ErrorMessageProps = {
  className?: string;
  error: Error | FlowserError | string;
};

export const ErrorMessage: FunctionComponent<ErrorMessageProps> = ({
  className,
  error,
}) => {
  const { title, description } = getErrorInfo(error);
  return (
    <Message title={title} description={description} className={className} />
  );
};

type ErrorInfo = {
  title: string;
  description?: string;
};

function getErrorInfo(error: Error | FlowserError | string): ErrorInfo {
  if (CommonUtils.isFlowserError(error)) {
    return {
      title: error.message,
      description: error.description,
    };
  }
  if (CommonUtils.isStandardError(error)) {
    return {
      title: error.message,
    };
  }
  return {
    title: error,
  };
}
