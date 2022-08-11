import React, { ForwardRefRenderFunction } from "react";
import classes from "./TextArea.module.scss";

export type TextAreaProps = React.DetailedHTMLProps<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
> & {
  value?: string;
  disabled?: boolean;
  rows?: number;
};

const TextArea: ForwardRefRenderFunction<HTMLTextAreaElement, TextAreaProps> = (
  { rows = 6, value = "", disabled = false, ...restProps }: TextAreaProps,
  ref
) => {
  return (
    <div className={classes.root}>
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        value={value}
        {...restProps}
      />
    </div>
  );
};

export default React.forwardRef(TextArea);
