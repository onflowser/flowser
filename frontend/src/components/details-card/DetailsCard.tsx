import classNames from "classnames";
import Label from "components/label/Label";
import Value from "components/value/Value";
import React, { CSSProperties, FC, ReactElement } from "react";
import Card from "../card/Card";
import classes from "./DetailsCard.module.scss";
import { SizedBox } from "../sized-box/SizedBox";

export type DetailsCardRow = {
  label: ReactElement | string;
  value: ReactElement | string;
};

export type DetailsCardColumn = DetailsCardRow[];

export type DetailsCardProps = {
  columns: DetailsCardColumn[];
  className?: string;
};

export const DetailsCard: FC<DetailsCardProps> = ({ columns, className }) => {
  return (
    <Card className={classNames(classes.root, className)}>
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
        {/* TODO(design-revamp): Avoid this hack */}
        {/* A hack to add some padding at the end using col-gap */}
        <SizedBox width={1} />
      </div>
    </Card>
  );
};
