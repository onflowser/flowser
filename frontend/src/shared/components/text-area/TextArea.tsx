import React, { ForwardRefRenderFunction } from "react";
import classes from "./TextArea.module.scss";

type TextAreaProps = React.DetailedHTMLProps<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
>;

type Props = TextAreaProps & {
  value?: string;
  disabled?: boolean;
  rows?: number;
};

const TextArea: ForwardRefRenderFunction<HTMLTextAreaElement, Props> = (
  { rows = 6, value = "", disabled = false, ...restProps }: Props,
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
