import React, { ReactElement } from "react";
import classes from "./Breadcrumbs.module.scss";
import classNames from "classnames";
import { FlowserIcon } from "../../icons/FlowserIcon";
import { useCurrentWorkspaceId } from "../../../hooks/use-current-project-id";
import { useMatches, useNavigate } from "../../../contexts/navigation.context";

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
  const projectId = useCurrentWorkspaceId();

  function shouldShowMatch(match: Match) {
    // For project pages, only show matches from project-scoped routes.
    // This is to avoid showing the "Projects" crumb on every page.
    return !projectId || match.pathname.startsWith(`/projects/${projectId}`);
  }

  const matches: Match[] = useMatches();
  const matchesWithCrumbs: MatchWithCrumb[] = matches
    .filter(isMatchWithCrumb)
    .filter(shouldShowMatch);
  const breadcrumbs = matchesWithCrumbs.map(
    (match): Breadcrumb => ({
      to: match.pathname,
      label: match.handle.crumbName,
    }),
  );

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <div className={classNames(classes.root, props.className)}>
      {breadcrumbs.length > 1 && (
        <div className={classes.backButtonWrapper} onClick={() => navigate(-1)}>
          <FlowserIcon.Back className={classes.backButton} />
        </div>
      )}
      <div className={classes.breadcrumbs}>
        {breadcrumbs
          .map<React.ReactNode>((item, key) => (
            // TODO(web-mvp): Update styles
            <div key={key} onClick={() => navigate(item.to)}>
              {item.label}
            </div>
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
