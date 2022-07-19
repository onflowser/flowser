import React, { FunctionComponent } from "react";
import classes from "./Button.module.scss";
import Loader from "react-loader-spinner";

export interface ButtonProps {
  onClick?: (event: any) => void;
  variant?: "big" | "middle" | "normal";
  disabled?: boolean;
  outlined?: boolean;
  loading?: boolean;
  loaderColor?: string;
  [key: string]: any;
}

type Props = ButtonProps;

const Button: FunctionComponent<Props> = ({
  onClick = () => true,
  disabled = false,
  variant = "normal",
  outlined = false,
  loading = false,
  loaderColor = "#141C2D",
  ...restProps
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      {...restProps}
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
