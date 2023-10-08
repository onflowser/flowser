import React, { FunctionComponent } from "react";
import { CommonUtils } from "../../utils/common-utils";
import { Message } from "./Message";

export type ErrorMessageProps = {
  className?: string;
  error: Error | string;
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

function getErrorInfo(error: Error | string): ErrorInfo {
  if (CommonUtils.isStandardError(error)) {
    return {
      title: error.message,
    };
  }
  return {
    title: error,
  };
}
