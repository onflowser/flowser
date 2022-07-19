import React, { FunctionComponent, ReactElement } from "react";
import classes from "./Dialog.module.scss";
import Card from "../card/Card";

interface OwnProps {
  children: ReactElement[] | ReactElement;
  onClose: () => void;
  className?: string;
  [key: string]: any;
}

type Props = OwnProps;

const Dialog: FunctionComponent<Props> = ({
  children,
  onClose,
  className = "",
}) => {
  const onOutsideClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onClose();
  };

  const onClickInside = (event: React.MouseEvent) => {
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
