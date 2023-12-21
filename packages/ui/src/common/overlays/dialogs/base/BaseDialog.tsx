import React, {
  FunctionComponent,
  MouseEventHandler,
  ReactNode, useRef
} from "react";
import classes from "./BaseDialog.module.scss";
import classNames from "classnames";
import { BaseCard } from "../../../cards/BaseCard/BaseCard";

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
  const isClickInitiatedInside = useRef<boolean>();

  const onOutsideClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (isClickInitiatedInside.current) {
      onClose(event);
    }
  };

  const onClickInside = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    isClickInitiatedInside.current = true;
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
