import React, { FC, ReactNode } from "react";
import { Breadcrumbs } from "../../misc/Breadcrumbs/Breadcrumbs";
import classes from "./BasicLayout.module.scss";

export const BasicLayout: FC<{ children: ReactNode }> = (props) => {
  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Breadcrumbs className={classes.breadcrumbs} />
      </div>
      {props.children}
    </div>
  );
};
