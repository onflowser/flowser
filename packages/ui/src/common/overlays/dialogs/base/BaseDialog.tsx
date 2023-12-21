import React, {
  FunctionComponent,
  MouseEventHandler,
  ReactNode
} from "react";
import classes from "./BaseDialog.module.scss";
import classNames from "classnames";
import { BaseCard } from "../../../cards/BaseCard/BaseCard";
import { FlowserIcon } from "../../../icons/FlowserIcon";

export type DialogProps = {
  children: ReactNode;
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
          <FlowserIcon.Close
            className={classes.closeButton}
            width={20}
            height={20}
            onClick={onClose}
          />
          {children}
        </BaseCard>
      </div>
    </div>
  );
};
