import React, { FunctionComponent, ReactElement } from "react";
import Card from "../card/Card";
import classes from "./DetailsCard.module.scss";

type DetailsCardProps = {
  header?: ReactElement;
  footer?: ReactElement;
};

const DetailsCard: FunctionComponent<DetailsCardProps> = ({
  children,
  header,
  footer,
}) => {
  return (
    <div>
      {header && <div className={classes.header}>{header}</div>}
      <Card className={classes.container}>
        <div className={classes.body}>{children}</div>
        {footer && <div className={classes.footer}>{footer}</div>}
      </Card>
    </div>
  );
};

export default DetailsCard;
