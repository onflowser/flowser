import React, { FunctionComponent, InputHTMLAttributes } from "react";
import classes from "./Input.module.scss";
import classNames from "classnames";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input: FunctionComponent<InputProps> = ({
  type = "text",
  value = "",
  disabled = false,
  onChange = () => false,
  className,
  ...restProps
}) => {
  return (
    <div className={classNames(classes.root, className)}>
      <input
        disabled={disabled}
        type={type}
        value={value}
        onChange={onChange}
        {...restProps}
      />
    </div>
  );
};
