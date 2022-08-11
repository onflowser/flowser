import classes from "./Code.module.scss";
import React, { FC } from "react";

type CodeProps = {
  code?: string;
};

const Code: FC<CodeProps> = ({ code }) => {
  return <pre className={classes.code}>{code}</pre>;
};

export default Code;
