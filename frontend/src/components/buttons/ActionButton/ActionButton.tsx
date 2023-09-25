import React, { ReactElement } from "react";
import { SimpleButton } from "../SimpleButton/SimpleButton";
import classes from "./ActionButton.module.scss";

export type ActionButtonProps = {
  onClick: () => void;
  title: string;
  footer?: string;
  icon: ReactElement;
};

export function ActionButton({
  onClick,
  title,
  footer,
  icon,
}: ActionButtonProps): ReactElement {
  return (
    <SimpleButton className={classes.root} onClick={onClick}>
      <div className={classes.icon}>{icon}</div>
      <div className={classes.mainWrapper}>
        <div className={classes.header}>{title}</div>
        {footer && <span className={classes.footer}>{footer}</span>}
      </div>
    </SimpleButton>
  );
}
