import React, { FunctionComponent, HTMLAttributes } from "react";
import { NavLink } from "react-router-dom";
import { useNavigation } from "../../hooks/use-navigation";
import classes from "./Breadcrumbs.module.scss";

export type BreadCrumbsProps = HTMLAttributes<HTMLDivElement>;

const Breadcrumbs: FunctionComponent<BreadCrumbsProps> = ({ className }) => {
  const { breadcrumbs } = useNavigation();

  if (breadcrumbs.length === 0) {
    return <></>;
  }

  const currentUrl = window.location.pathname;

  return (
    <div className={`${classes.root} ${className}`}>
      {breadcrumbs
        .map<React.ReactNode>((item, key) => (
          <NavLink key={key} to={item.to || currentUrl}>
            {item.label}
          </NavLink>
        ))
        .reduce((prev, curr, i) => [prev, <span key={++i}>{">>"}</span>, curr])}
    </div>
  );
};

export default Breadcrumbs;
