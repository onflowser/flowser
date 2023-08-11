import React, { FunctionComponent, HTMLAttributes } from "react";
import classes from "./Button.module.scss";
import Loader from "react-loader-spinner";

export type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  HTMLAttributes<HTMLButtonElement> & {
    variant?: "big" | "middle" | "normal";
    disabled?: boolean;
    outlined?: boolean;
    loading?: boolean;
    loaderColor?: string;
  };

const Button: FunctionComponent<ButtonProps> = ({
  onClick,
  disabled = false,
  variant = "normal",
  outlined = false,
  loading = false,
  loaderColor = "#363F53",
  ...restProps
}) => {
  return (
    <button
      {...restProps}
      onClick={onClick}
      disabled={disabled}
      className={`${classes.button} ${classes[variant]} ${
        disabled ? classes.disabled : ""
      } ${restProps.className} ${outlined ? classes.outlined : ""}`}
    >
      {loading && (
        <div className={classes.loaderWrapper}>
          <Loader type="Oval" color={loaderColor} height={25} width={25} />
        </div>
      )}
      <div className={loading ? classes.hiddenChildren : ""}>
        {restProps.children}
      </div>
    </button>
  );
};

export default Button;
