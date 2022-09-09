import Label from "components/label/Label";
import Value from "components/value/Value";
import React, { FunctionComponent, ReactElement } from "react";
import Card from "../card/Card";
import classes from "./DetailsCard.module.scss";

export type column = Array<{
  label: ReactElement | string;
  value: ReactElement | string;
}>;

export type DetailsCardProps = {
  columns: column[];
};

export const DetailsCard = ({ columns }: DetailsCardProps) => {
  return (
    <div className={classes.root}>
      <Card className={classes.bigCard}>
        <div className={classes.bigCardContent}>
          {columns?.map((column, index) => (
            <div className={classes.bigCardColumn} key={index}>
              {column?.map((row, i) => (
                <div key={i}>
                  <Label variant="medium" className={classes.label}>
                    {row.label}
                  </Label>
                  <Value variant="small" className={classes.value}>
                    {row.value}
                  </Value>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
