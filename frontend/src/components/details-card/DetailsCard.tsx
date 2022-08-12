import React, { FunctionComponent } from "react";
import Card from "../card/Card";
import classes from "./DetailsCard.module.scss";

type DetailsCardProps = {
  Header?: FunctionComponent;
  Footer?: FunctionComponent;
};

const DetailsCard: FunctionComponent<DetailsCardProps> = ({
  children,
  Header,
  Footer,
}) => {
  return (
    <div>
      {Header && (
        <div className={classes.header}>
          <Header />
        </div>
      )}
      <Card className={classes.container}>
        <div className={classes.body}>{children}</div>
        {Footer && (
          <div className={classes.footer}>
            <Footer />
          </div>
        )}
      </Card>
    </div>
  );
};

export default DetailsCard;
