import React, {
  FunctionComponent,
  MouseEventHandler,
  ReactElement,
} from "react";
import classes from "./BaseDialog.module.scss";
import classNames from "classnames";
import { BaseCard } from "../../../cards/BaseCard/BaseCard";

export type DialogProps = {
  children: ReactElement[] | ReactElement;
  onClose: MouseEventHandler<HTMLDivElement>;
  className?: string;
};

export const BaseDialog: FunctionComponent<DialogProps> = ({
  children,
  onClose,
  className,
}) => {
  const onOutsideClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onClose(event);
  };

  const onClickInside = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div className={classes.root} onClick={onOutsideClick}>
      <div className={classNames(classes.dialog, className)}>
        <BaseCard className={classes.card} onClick={onClickInside}>
          {children}
        </BaseCard>
      </div>
    </div>
  );
};
