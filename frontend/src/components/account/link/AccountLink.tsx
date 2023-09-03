import React, { ReactElement } from "react";
import { NavLink } from "react-router-dom";
import { AccountAvatar } from "../avatar/AccountAvatar";
import { AccountName } from "../name/AccountName";
import classes from "./AccountLink.module.scss";
import { ProjectLink } from "../../link/ProjectLink";

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
