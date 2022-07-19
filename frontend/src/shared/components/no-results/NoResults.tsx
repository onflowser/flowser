import React, { FunctionComponent } from "react";
import { ReactComponent as NoResultsIcon } from "../../assets/icons/no-results.svg";
import classes from "./NoResults.module.scss";

interface OwnProps {
  [key: string]: any;
}

type Props = OwnProps;

const NoResults: FunctionComponent<Props> = ({ ...restProps }) => {
  return (
    <div className={`${classes.root} ${restProps.className}`}>
      <NoResultsIcon />
      <h3>It looks like there is nothing here.</h3>
      <p>No results found</p>
    </div>
  );
};

export default NoResults;
