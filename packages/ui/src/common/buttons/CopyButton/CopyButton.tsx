import React, { FunctionComponent, useCallback } from "react";
import copy from "copy-to-clipboard";
import toast from "react-hot-toast";
import classes from "./CopyButton.module.scss";
import { FlowserIcon } from "../../icons/FlowserIcon";

export type CopyButtonProps = {
  value: string;
};

export const CopyButton: FunctionComponent<CopyButtonProps> = ({ value }) => {
  const MAX_CHARS_DISPLAY = 60;

  const displayValue =
    value.length > MAX_CHARS_DISPLAY
      ? value.substr(0, MAX_CHARS_DISPLAY) + "..."
      : value;

  const copyToClipboard = useCallback(() => {
    copy(value);
    toast(`"${displayValue}" copied to your clipboard`);
  }, []);
  return (
    <span className={classes.root}>
      <FlowserIcon.Copy onClick={copyToClipboard} />
    </span>
  );
};
