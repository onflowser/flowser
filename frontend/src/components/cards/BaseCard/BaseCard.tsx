import React, { FunctionComponent, HTMLAttributes } from "react";
import classes from "./BaseCard.module.scss";
import classNames from "classnames";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  className?: string;
  active?: boolean;
  showIntroAnimation?: boolean;
};

export const BaseCard: FunctionComponent<CardProps> = ({
  children,
  className,
  active = false,
  showIntroAnimation,
  ...restProps
}) => {
  return (
    <div
      className={classNames(classes.root, className, {
        [classes.active]: active,
        [classes.introAnimation]: showIntroAnimation,
      })}
      {...restProps}
    >
      {children}
    </div>
  );
};
