import React, { ReactElement } from "react";
import { NavLink } from "react-router-dom";
import { AccountAvatar } from "../AccountAvatar/AccountAvatar";
import { AccountName } from "../AccountName/AccountName";
import classes from "./AccountLink.module.scss";
import { ProjectLink } from "../../common/links/ProjectLink";

type AccountLinkProps = {
  address: string;
};

export function AccountLink(props: AccountLinkProps): ReactElement {
  const { address } = props;
  return (
    <ProjectLink to={`/accounts/${address}`} className={classes.root}>
      <AccountAvatar address={address} size={25} />
      <AccountName address={address} />
    </ProjectLink>
  );
}
