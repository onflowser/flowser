import React, { FunctionComponent, HTMLAttributes } from "react";
import classes from "./Button.module.scss";
import classNames from "classnames";
import { Spinner } from "../../spinner/Spinner";

export type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  HTMLAttributes<HTMLButtonElement> & {
    variant?: "big" | "middle" | "normal";
    disabled?: boolean;
    outlined?: boolean;
    loading?: boolean;
  };

const Button: FunctionComponent<ButtonProps> = ({
  onClick,
  disabled = false,
  variant = "normal",
  outlined = false,
  loading = false,
  ...restProps
}) => {
  return (
    <button
      {...restProps}
      onClick={onClick}
      disabled={disabled}
      className={classNames(
        classes.button,
        classes[variant],
        restProps.className,
        {
          [classes.disabled]: disabled,
          [classes.outlined]: outlined,
        }
      )}
    >
      {loading && (
        <div className={classes.loaderWrapper}>
          <Spinner size={25} />
        </div>
      )}
      <div
        className={classNames({
          [classes.hiddenChildren]: loading,
        })}
      >
        {restProps.children}
      </div>
    </button>
  );
};

export default Button;
