import React, { ReactElement } from "react";
import { NavLink, useMatches, useNavigate } from "react-router-dom";
import classes from "./Breadcrumbs.module.scss";
import { ReactComponent as IconBackButton } from "../../assets/icons/back-button.svg";
import classNames from "classnames";

type BreadcrumbsProps = {
  className?: string;
};

type CrumbHandle = {
  crumbName: string;
};

type Match = { pathname: string; handle: unknown };

type MatchWithCrumb = {
  pathname: string;
  handle: CrumbHandle;
};

type Breadcrumb = {
  to: string;
  label: string;
};

// Utility function used to create a handle with crumbs in a type-safe way.
export function createCrumbHandle(crumbHandle: CrumbHandle): CrumbHandle {
  return crumbHandle;
}

function isMatchWithCrumb(match: Match): match is MatchWithCrumb {
  return match.handle instanceof Object && "crumbName" in match.handle;
}

export function Breadcrumbs(props: BreadcrumbsProps): ReactElement | null {
  const navigate = useNavigate();
  const currentUrl = window.location.pathname;

  const matches: Match[] = useMatches();
  const matchesWithCrumbs: MatchWithCrumb[] = matches.filter(isMatchWithCrumb);
  const breadcrumbs = matchesWithCrumbs.map(
    (match): Breadcrumb => ({
      to: match.pathname,
      label: match.handle.crumbName,
    })
  );

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <div className={classNames(classes.root, props.className)}>
      {breadcrumbs.length > 1 && (
        <div className={classes.backButtonWrapper} onClick={() => navigate(-1)}>
          <IconBackButton className={classes.backButton} />
        </div>
      )}
      <div className={classes.breadcrumbs}>
        {breadcrumbs
          .map<React.ReactNode>((item, key) => (
            <NavLink key={key} to={item.to || currentUrl}>
              {item.label}
            </NavLink>
          ))
          .reduce((prev, curr, i) => [
            prev,
            <span key={++i} className={classes.arrow}>
              {">>"}
            </span>,
            curr,
          ])}
      </div>
    </div>
  );
}
