import Label from "components/label/Label";
import Value from "components/value/Value";
import React, { FC, ReactElement } from "react";
import Card from "../card/Card";
import classes from "./DetailsCard.module.scss";

export type DetailsCardRow = {
  label: ReactElement | string;
  value: ReactElement | string;
};

export type DetailsCardColumn = DetailsCardRow[];

export type DetailsCardProps = {
  columns: DetailsCardColumn[];
};

export const DetailsCard: FC<DetailsCardProps> = ({ columns }) => {
  return (
    <Card className={classes.root}>
      <div className={classes.content}>
        {columns?.map((rows, index) => (
          <div className={classes.column} key={index}>
            {rows?.map((row, i) => (
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
  );
};
