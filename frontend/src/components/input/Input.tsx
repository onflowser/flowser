import React, { FunctionComponent, InputHTMLAttributes } from "react";
import classes from "./Input.module.scss";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input: FunctionComponent<InputProps> = ({
  type = "text",
  value = "",
  disabled = false,
  onChange = () => false,
  ...restProps
}) => {
  return (
    <div className={classes.root}>
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

export default Input;
