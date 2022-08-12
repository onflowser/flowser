import React, { FunctionComponent, useEffect, useState } from "react";
import { ReactComponent as CaretIconSvg } from "../../assets/icons/caret.svg";
import classes from "./CaretIcon.module.scss";

type CaretIconProps = {
  isOpen?: boolean;
  onChange?: (isOpen: boolean) => void;
  className?: string;
  inverted?: boolean; // Close state is upside orientated instead of downside orientated
};

const CaretIcon: FunctionComponent<CaretIconProps> = ({
  isOpen = false,
  onChange = () => false,
  inverted = false,
  ...restProps
}) => {
  const [state, setState] = useState(isOpen);

  useEffect(() => {
    setState(isOpen);
  }, [isOpen]);

  const onToggle = () => {
    setState(!state);
    onChange(state);
  };

  return (
    <CaretIconSvg
      className={`${classes.root} ${restProps.className} ${
        state ? classes.isOpen : ""
      } ${inverted ? classes.inverted : ""}`}
      onClick={onToggle}
    />
  );
};

export default CaretIcon;
