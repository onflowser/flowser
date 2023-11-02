import classNames from "classnames";
import React, { FunctionComponent, useEffect, useState } from "react";
import classes from "./CaretIcon.module.scss";
import { FlowserIcon } from "../FlowserIcon";

type CaretIconProps = {
  isOpen?: boolean;
  onChange?: (isOpen: boolean) => void;
  className?: string;
  inverted?: boolean; // Close state is upside orientated instead of downside orientated
};

export const CaretIcon: FunctionComponent<CaretIconProps> = ({
  isOpen = false,
  onChange = () => false,
  inverted = false,
  className,
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
    <FlowserIcon.Caret
      className={classNames(classes.root, className, {
        [classes.isOpen]: state,
        [classes.inverted]: inverted,
      })}
      onClick={onToggle}
    />
  );
};
