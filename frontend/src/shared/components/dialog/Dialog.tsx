import React, {
  FunctionComponent,
  MouseEventHandler,
  ReactElement,
} from "react";
import classes from "./Dialog.module.scss";
import Card from "../card/Card";

export type DialogProps = {
  children: ReactElement[] | ReactElement;
  onClose: MouseEventHandler<HTMLDivElement>;
  className?: string;
};

const Dialog: FunctionComponent<DialogProps> = ({
  children,
  onClose,
  className = "",
}) => {
  const onOutsideClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onClose(event);
  };

  const onClickInside = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div className={`${classes.root}`} onClick={onOutsideClick}>
      <div className={`${classes.dialog} ${className}`}>
        <Card className={classes.card} onClick={onClickInside}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export default Dialog;
