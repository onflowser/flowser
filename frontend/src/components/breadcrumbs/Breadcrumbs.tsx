import React, { ReactElement } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useNavigation } from "../../hooks/use-navigation";
import classes from "./Breadcrumbs.module.scss";
import { ReactComponent as IconBackButton } from "../../assets/icons/back-button.svg";
import classNames from "classnames";

type BreadcrumbsProps = {
  className?: string;
};

export function Breadcrumbs(props: BreadcrumbsProps): ReactElement | null {
  const { isShowBackButtonVisible, isBreadcrumbsVisible, breadcrumbs } =
    useNavigation();
  const navigate = useNavigate();
  const currentUrl = window.location.pathname;

  if (!isBreadcrumbsVisible) {
    return null;
  }

  return (
    <div className={classNames(classes.root, props.className)}>
      {isShowBackButtonVisible && (
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
